"""섯다라인 애드온 서버 — 로그인(디스코드) + 설정 동기화.

실행(VM): .venv/bin/uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000 \
           --proxy-headers --forwarded-allow-ips 127.0.0.1
앞단 Caddy(https://starline-bot.duckdns.org)가 127.0.0.1:8000 으로 넘긴다.
명세: StarlineBot/mabinogi_addon docs/account-management-spec.md 3절.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import secrets
import time
from pathlib import Path
from urllib.parse import urlencode

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response

from .bundle import BundleError, inspect_bundle
from .config import Settings, load_settings
from .db import Database
from .discord_oauth import DiscordError, DiscordOAuth
from .ratelimit import RateLimiter
from .tokens import TokenError, TokenSigner

log = logging.getLogger("addon_server")

STATE_RE = re.compile(r"^[A-Za-z0-9_\-]{8,128}$")
INSTALL_RE = re.compile(r"^[0-9a-f]{16,32}$")
GUEST_INSTALL_WINDOW = 600   # 비로그인: 설치당 10분에 1회(앱은 켤 때 + 1시간마다)
GUEST_RATE_PER_MIN = 300     # 비로그인: 전체 분당
GUEST_MAX_ROWS = 100_000     # 비로그인 행 상한(넘으면 오래된 것부터 삭제) — 묶음을 저장하지 않아 한 행이 수백 바이트
RESOLUTION_RE = re.compile(r"^\d{2,5}x\d{2,5}$")
LOGIN_TTL = 600          # 로그인 시작~콜백 허용 시간(초)
MAX_PENDING_LOGINS = 2000
AUTH_RATE_PER_MIN = 30   # /auth/start·callback, IP당


def _page(title: str, body: str, status: int = 200) -> HTMLResponse:
    html = (f"<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'>"
            f"<title>{title}</title><body style='font-family:sans-serif;text-align:center;padding:48px'>"
            f"<h2>{title}</h2><p>{body}</p></body>")
    return HTMLResponse(html, status_code=status)


def _local_redirect(port: int, **params: str) -> RedirectResponse:
    # 호스트는 항상 localhost 고정(열린 리다이렉트 방지). 포트만 앱이 정한다.
    return RedirectResponse(f"http://localhost:{port}/callback?" + urlencode(params), status_code=302)


class _HideGuestAccess(logging.Filter):
    """uvicorn 접근 로그에서 /guest/ 요청을 뺀다(비로그인 경로는 IP를 남기지 않음 — 명세 3.4.3)."""
    def filter(self, record: logging.LogRecord) -> bool:
        args = record.args if isinstance(record.args, tuple) else ()
        return not (len(args) >= 3 and str(args[2]).startswith("/guest/"))


def create_app(settings: Settings | None = None, discord: DiscordOAuth | None = None) -> FastAPI:
    settings = settings or load_settings()
    if not settings.token_signing_key:
        raise RuntimeError("TOKEN_SIGNING_KEY가 없어요 — addon_server/.env 를 확인하세요(scripts/genkey.py)")
    signer = TokenSigner(settings.token_signing_key, settings.token_ttl_days)
    db = Database(settings.db_path)
    settings.settings_dir.mkdir(parents=True, exist_ok=True)
    discord = discord or DiscordOAuth(settings.discord_client_id, settings.discord_client_secret,
                                      settings.redirect_uri)

    pending: dict[str, tuple[str, int, float]] = {}  # 서버 state → (앱 state, 앱 포트, 만료)
    auth_limiter = RateLimiter(AUTH_RATE_PER_MIN)
    user_limiter = RateLimiter(settings.rate_limit_per_min)
    upload_locks: dict[str, asyncio.Lock] = {}
    guest_install_limiter = RateLimiter(1, window=GUEST_INSTALL_WINDOW)
    guest_total_limiter = RateLimiter(GUEST_RATE_PER_MIN)
    access_log = logging.getLogger("uvicorn.access")
    if not any(isinstance(f, _HideGuestAccess) for f in access_log.filters):
        access_log.addFilter(_HideGuestAccess())

    app = FastAPI(title="섯다라인 애드온 서버", docs_url=None, redoc_url=None, openapi_url=None)
    app.state.settings, app.state.db, app.state.signer = settings, db, signer
    app.state.guest_install_limiter, app.state.guest_total_limiter = guest_install_limiter, guest_total_limiter

    def tier_of(discord_id: str) -> str:
        return "creator" if discord_id in settings.creator_ids else "user"

    def client_ip(request: Request) -> str:
        return request.client.host if request.client else "?"

    def limit_auth(request: Request) -> None:
        if not auth_limiter.hit("ip:" + client_ip(request)):
            raise HTTPException(429, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.")

    def current_user(request: Request) -> dict:
        auth = request.headers.get("authorization", "")
        if not auth.lower().startswith("bearer "):
            raise HTTPException(401, "로그인이 필요해요", headers={"WWW-Authenticate": "Bearer"})
        try:
            claims = signer.verify(auth[7:].strip())
        except TokenError as e:
            raise HTTPException(401, str(e), headers={"WWW-Authenticate": "Bearer"}) from e
        uid = claims["sub"]
        if not user_limiter.hit("user:" + uid):
            raise HTTPException(429, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.")
        user = db.get_user(uid)
        if not user:
            raise HTTPException(401, "알 수 없는 사용자예요. 다시 로그인해 주세요.")
        if user["status"] == "blocked":
            raise HTTPException(403, "이용이 제한된 계정이에요")
        return user

    # ── 운영 ──
    def local_only(request: Request) -> None:
        """VM 내부(봇 등)에서 직접 온 요청만 허용. Caddy를 거친 외부 요청은 X-Forwarded-For가 붙어 거절된다."""
        host = request.client.host if request.client else ""
        if host not in ("127.0.0.1", "::1") or request.headers.get("x-forwarded-for"):
            raise HTTPException(403, "내부 전용이에요")

    @app.get("/internal/users", dependencies=[Depends(local_only)])
    def internal_users():
        """봇 제작자 '!현황 애드온' 용 — 사용자별 로그인·동기화 현황(설정 묶음 내용은 주지 않음)."""
        with db.connect() as conn:
            rows = conn.execute(
                """SELECT u.discord_id, u.name, u.tier, u.status, u.created, u.last_seen, u.logged_out,
                          s.rev, s.updated, s.device, s.resolution, s.size, s.features, s.app
                   FROM users u LEFT JOIN settings s USING(discord_id)
                   ORDER BY COALESCE(s.updated, u.last_seen) DESC""").fetchall()
        users = []
        for r in rows:
            item = {k: r[k] for k in ("discord_id", "name", "tier", "status", "created", "last_seen", "logged_out")}
            item["settings"] = None if r["rev"] is None else {
                "rev": r["rev"], "updated": r["updated"], "device": r["device"], "resolution": r["resolution"],
                "size": r["size"], "app": r["app"], "features": json.loads(r["features"] or "{}")}
            users.append(item)
        with db.connect() as conn:
            grows = conn.execute("SELECT * FROM guests ORDER BY updated DESC").fetchall()
        guests = [{"install_id": g["install_id"], "updated": g["updated"], "resolution": g["resolution"],
                   "size": g["size"], "app": g["app"], "features": json.loads(g["features"] or "{}")} for g in grows]
        return {"users": users, "guests": guests}

    @app.get("/health")
    def health():
        with db.connect() as conn:
            conn.execute("SELECT 1")
        return {"ok": True}

    # ── 로그인 ──
    @app.get("/auth/start", dependencies=[Depends(limit_auth)])
    def auth_start(state: str, port: int = 53123):
        if not STATE_RE.match(state):
            raise HTTPException(400, "state 형식이 올바르지 않아요")
        if not 1024 <= port <= 65535:
            raise HTTPException(400, "port 범위가 올바르지 않아요")
        now = time.monotonic()
        for k in [k for k, v in pending.items() if v[2] < now]:
            pending.pop(k, None)
        if len(pending) >= MAX_PENDING_LOGINS:
            raise HTTPException(503, "로그인 요청이 몰려 있어요. 잠시 후 다시 시도해 주세요.")
        server_state = secrets.token_urlsafe(24)
        pending[server_state] = (state, port, now + LOGIN_TTL)
        return RedirectResponse(discord.authorize_url(server_state), status_code=302)

    @app.get("/auth/callback", dependencies=[Depends(limit_auth)])
    async def auth_callback(state: str = "", code: str = "", error: str = ""):
        entry = pending.pop(state, None)
        if not entry or entry[2] < time.monotonic():
            return _page("로그인 요청이 만료됐어요", "앱에서 '디스코드로 로그인'을 다시 눌러 주세요.", 400)
        app_state, port, _ = entry
        if error or not code:
            return _local_redirect(port, error="access_denied", state=app_state)
        try:
            me = await discord.fetch_user(code)
        except (DiscordError, Exception) as e:  # noqa: BLE001 — 네트워크 오류 포함
            log.warning("디스코드 로그인 실패: %s", e)
            return _local_redirect(port, error="login_failed", state=app_state)
        tier = tier_of(me["id"])
        user = db.upsert_login(me["id"], me["name"], tier)
        if user["status"] == "blocked":
            return _local_redirect(port, error="blocked", state=app_state)
        token, _exp = signer.issue(me["id"], me["name"], tier)
        log.info("로그인: %s (%s)", me["id"], tier)
        return _local_redirect(port, token=token, state=app_state)

    @app.get("/me")
    def me(user: dict = Depends(current_user)):
        tier = tier_of(user["discord_id"])  # 제작자 목록이 바뀌면 다음 갱신 때 반영
        db.touch(user["discord_id"], tier)
        token, exp = signer.issue(user["discord_id"], user["name"], tier)
        return {"id": user["discord_id"], "name": user["name"], "tier": tier, "status": user["status"],
                "token": token, "expiresAt": exp}

    @app.post("/auth/logout", status_code=204)
    def logout(user: dict = Depends(current_user)):
        db.mark_logged_out(user["discord_id"])
        return Response(status_code=204)

    # ── 설정 동기화 ──
    def settings_file(discord_id: str) -> Path:
        return settings.settings_dir / f"{discord_id}.zip"

    @app.get("/settings")
    def get_settings(user: dict = Depends(current_user)):
        meta = db.get_settings(user["discord_id"])
        if not meta:
            return {"exists": False, "rev": 0}
        return {"exists": True, "rev": meta["rev"], "updated": meta["updated"], "device": meta["device"],
                "resolution": meta["resolution"], "size": meta["size"]}

    @app.get("/settings/blob")
    def get_settings_blob(user: dict = Depends(current_user)):
        meta = db.get_settings(user["discord_id"])
        path = settings_file(user["discord_id"])
        if not meta or not path.is_file():
            raise HTTPException(404, "서버에 저장된 설정이 없어요")
        return Response(path.read_bytes(), media_type="application/zip",
                        headers={"X-Settings-Rev": str(meta["rev"])})

    @app.put("/settings")
    async def put_settings(request: Request, device: str = "", resolution: str = "",
                           user: dict = Depends(current_user)):
        uid = user["discord_id"]
        if_match = request.headers.get("if-match")
        if if_match is None:
            raise HTTPException(428, "If-Match(내가 받은 rev)가 필요해요. 처음이면 0")
        try:
            expected = int(if_match.strip().removeprefix("W/").strip('"'))
        except ValueError as e:
            raise HTTPException(400, "If-Match는 숫자 rev여야 해요") from e

        limit = settings.max_settings_bytes
        declared = request.headers.get("content-length")
        if declared and declared.isdigit() and int(declared) > limit:
            raise HTTPException(413, f"설정 묶음은 {limit // (1024 * 1024)}MB까지예요")
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > limit:
                raise HTTPException(413, f"설정 묶음은 {limit // (1024 * 1024)}MB까지예요")
        if not body:
            raise HTTPException(422, "설정 묶음이 비어 있어요")
        try:
            info = inspect_bundle(bytes(body))
        except BundleError as e:
            raise HTTPException(e.status, str(e)) from e

        device = "".join(ch for ch in device if ch.isprintable())[:64] or None
        resolution = resolution if RESOLUTION_RE.match(resolution or "") else None

        lock = upload_locks.setdefault(uid, asyncio.Lock())
        async with lock:  # 같은 사용자의 동시 업로드 직렬화
            meta = db.get_settings(uid)
            current = meta["rev"] if meta else 0
            if expected != current:
                return JSONResponse({"detail": "다른 곳에서 먼저 저장했어요", "rev": current}, status_code=409)
            path = settings_file(uid)
            tmp = path.with_suffix(".zip.tmp")
            with open(tmp, "wb") as f:
                f.write(body)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, path)  # 원자적 교체
            new_rev = db.save_settings(uid, expected, device=device, resolution=resolution,
                                       size=len(body), features=info.features, app=info.app)
            if new_rev is None:  # 이론상 없음(잠금) — 방어
                return JSONResponse({"detail": "다른 곳에서 먼저 저장했어요", "rev": current}, status_code=409)
        saved = db.get_settings(uid)
        return {"rev": new_rev, "updated": saved["updated"], "size": len(body)}

    # ── 비로그인 설정 올리기(명세 3.4.3) — 토큰 없음, 묶음은 검사만 하고 정보만 저장, IP 저장 안 함 ──
    async def read_bundle(request: Request) -> bytes:
        limit = settings.max_settings_bytes
        declared = request.headers.get("content-length")
        if declared and declared.isdigit() and int(declared) > limit:
            raise HTTPException(413, f"설정 묶음은 {limit // (1024 * 1024)}MB까지예요")
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > limit:
                raise HTTPException(413, f"설정 묶음은 {limit // (1024 * 1024)}MB까지예요")
        if not body:
            raise HTTPException(422, "설정 묶음이 비어 있어요")
        return bytes(body)

    @app.put("/guest/settings", status_code=204)
    async def put_guest_settings(request: Request, resolution: str = ""):
        install_id = (request.headers.get("x-install-id") or "").strip()
        if not INSTALL_RE.match(install_id):
            raise HTTPException(400, "X-Install-Id 형식이 올바르지 않아요")
        if not guest_total_limiter.hit("all"):
            raise HTTPException(429, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.")
        if not guest_install_limiter.hit("install:" + install_id):
            raise HTTPException(429, "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.")
        body = await read_bundle(request)
        try:
            info = inspect_bundle(body)
        except BundleError as e:
            raise HTTPException(e.status, str(e)) from e
        db.save_guest(install_id, resolution=resolution if RESOLUTION_RE.match(resolution or "") else None,
                      size=len(body), features=info.features, app=info.app, max_rows=GUEST_MAX_ROWS)
        return Response(status_code=204)

    return app
