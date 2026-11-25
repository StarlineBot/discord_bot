"""비로그인 설정 올리기 PUT /guest/settings (명세 3.4.3) — 묶음은 검사만, 정보만 저장, IP 저장 안 함."""
import io
import json
import logging
import zipfile

from fastapi.testclient import TestClient

from app.main import _HideGuestAccess

IID = "0123456789abcdef0123456789abcdef"


def bundle(cfg=None, app="0.56.0", secret=False):
    cfg = cfg if cfg is not None else {"featureUsage": {"buff": "2026-11-23"}, "blackbox": {"enabled": True}}
    if secret:
        cfg = {**cfg, "nexonApiKey": "x"}
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("config.json", json.dumps(cfg))
        z.writestr("sync.json", json.dumps({"resolution": "2560x1440", "device": "", "app": app}))
    return buf.getvalue()


def put(client, data, iid=IID, resolution="2560x1440"):
    headers = {"Content-Type": "application/zip"}
    if iid is not None:
        headers["X-Install-Id"] = iid
    return client.put("/guest/settings", content=data, params={"resolution": resolution}, headers=headers)


def test_saves_info_only_no_token_needed(client, settings):
    r = put(client, bundle())
    assert r.status_code == 204, r.text
    g = client.app.state.db.get_guest(IID)
    assert g["features"] == {"buff": "2026-11-23"} and g["app"] == "0.56.0" and g["resolution"] == "2560x1440"
    assert g["size"] > 0
    assert set(g) == {"install_id", "updated", "resolution", "size", "features", "app", "character"}  # IP·PC 이름·묶음 칸 없음
    assert not any(settings.settings_dir.iterdir())  # 묶음 파일도 안 남김


def test_install_id_format(client):
    for bad in [None, "", "short", "0123456789ABCDEF", "g" * 16, "a" * 33, "../../etc/passwd0000"]:
        assert put(client, bundle(), iid=bad).status_code == 400, bad
    assert put(client, bundle(), iid="a" * 16).status_code == 204


def test_bundle_checks_same_as_settings(client, settings):
    assert put(client, b"not a zip", iid="1" * 32).status_code == 422
    assert put(client, bundle(secret=True), iid="2" * 32).status_code == 422
    assert put(client, b"", iid="3" * 32).status_code == 422
    big = b"0" * (settings.max_settings_bytes + 1)
    assert put(client, big, iid="4" * 32).status_code == 413
    assert client.app.state.db.get_guest("1" * 32) is None


def test_overwrite_and_rate_limit(client):
    assert put(client, bundle(app="0.56.0")).status_code == 204
    assert put(client, bundle(app="0.56.1")).status_code == 429  # 같은 설치는 10분에 1회
    assert put(client, bundle(), iid="b" * 32).status_code == 204  # 다른 설치는 따로
    # 10분 창이 지난 뒤엔 덮어쓰기(rev·충돌 없음)
    client.app.state.guest_install_limiter._hits.clear()
    assert put(client, bundle(app="0.56.1"), resolution="bad").status_code == 204
    g = client.app.state.db.get_guest(IID)
    assert g["app"] == "0.56.1" and g["resolution"] is None


def test_total_rate_limit(client):
    client.app.state.guest_total_limiter.limit = 2
    assert put(client, bundle(), iid="c" * 32).status_code == 204
    assert put(client, bundle(), iid="d" * 32).status_code == 204
    assert put(client, bundle(), iid="e" * 32).status_code == 429


def test_row_cap_drops_oldest(client):
    db = client.app.state.db
    for i in range(5):
        db.save_guest(f"{i:032x}", resolution=None, size=1, features={}, app=None, max_rows=3)
        with db.connect() as conn:  # updated를 순서대로(초 단위가 같아도 구분되게)
            conn.execute("UPDATE guests SET updated=? WHERE install_id=?", (f"2026-11-23T00:00:0{i}Z", f"{i:032x}"))
    db.save_guest(f"{9:032x}", resolution=None, size=1, features={}, app=None, max_rows=3)
    with db.connect() as conn:
        left = {r[0] for r in conn.execute("SELECT install_id FROM guests")}
    assert left == {f"{3:032x}", f"{4:032x}", f"{9:032x}"}


def test_internal_users_includes_guests(client):
    assert put(client, bundle()).status_code == 204
    local = TestClient(client.app, client=("127.0.0.1", 50000))
    guests = local.get("/internal/users").json()["guests"]
    assert guests[0]["install_id"] == IID and guests[0]["app"] == "0.56.0"


def test_access_log_hides_guest_path():
    f = _HideGuestAccess()
    rec = lambda path: logging.LogRecord("uvicorn.access", logging.INFO, "", 0, '%s - "%s %s HTTP/%s" %d',
                                         ("1.2.3.4:5", "PUT", path, "1.1", 204), None)
    assert f.filter(rec("/guest/settings?resolution=1x1")) is False
    assert f.filter(rec("/settings")) is True
