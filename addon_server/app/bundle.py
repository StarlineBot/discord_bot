"""설정 묶음(ZIP) 검사 + 기능 사용 값 추출.

앱의 config.export_bundle 형식: ZIP 안에 config.json(설정) + userdata/…(직접 집은 아이콘 등).
서버는 묶음을 풀지 않고 그대로 보관한다. 여기서는 형식·크기·경로만 확인하고 config.json과 sync.json만 읽는다.
sync.json = 앱 cloud_sync.build_blob이 넣는 동기화 정보 {"resolution", "device", "app"(앱 버전), "created"}.
"""
from __future__ import annotations

import io
import json
import re
import zipfile
from dataclasses import dataclass, field
from datetime import date
from pathlib import PurePosixPath

CONFIG_NAME = "config.json"
META_NAME = "sync.json"
MAX_META_BYTES = 16 * 1024          # sync.json은 몇십 바이트 — 크면 무시
MAX_APP_LEN = 32
APP_RE = re.compile(r"^[0-9A-Za-z][0-9A-Za-z.+_\-]*$")  # 예: 0.52.2, 0.53.0-beta.1
MAX_MEMBERS = 4096                  # 앱 BundleLimits.max_files 와 같음
MAX_UNCOMPRESSED = 64 * 1024 * 1024  # 앱 BundleLimits.max_source_bytes 와 같음(압축 폭탄 방지)
MAX_CONFIG_BYTES = 1024 * 1024      # 앱 BundleLimits.max_config_bytes 와 같음
# 서버에 남기면 안 되는 비밀값(앱 config._SECRET_KEYS) — 들어 있으면 거절
SECRET_KEYS = frozenset({"nexonApiKey", "inquiryWebhookUrl", "configWebhookUrl"})
MAX_FEATURES = 200


class BundleError(Exception):
    def __init__(self, message: str, status: int = 422):
        super().__init__(message)
        self.status = status


def _bad_name(name: str) -> bool:
    if not name or name.startswith(("/", "\\")) or "\\" in name or ":" in name:
        return True
    return ".." in PurePosixPath(name).parts


USAGE_KEY = "featureUsage"
MAX_USAGE = 64
USAGE_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LEGACY_HIDDEN = frozenset({"autofindV2"})  # 옛 앱(0.52.0 이하)이 남긴 옛 키 — 표시에서 뺀다


def _usage_date(value) -> str | None:
    """'YYYY-MM-DD'이고 실제 있는 날짜면 그대로, 아니면 None."""
    if not isinstance(value, str) or not USAGE_DATE_RE.match(value):
        return None
    try:
        date.fromisoformat(value)
    except ValueError:
        return None
    return value


def extract_features(cfg: dict) -> dict[str, bool | str]:
    """기능 사용 값.

    - 새 앱: 최상위 featureUsage {"<키>": "YYYY-MM-DD"}(기능별 마지막 실제 동작 날짜, 앱 현지 날짜)가 있으면
      그것만 쓴다 → {"<키>": "YYYY-MM-DD"} (최대 64개, 키 64자, 형식이 틀린 값은 버림).
      명세: StarlineBot/mabinogi_addon docs/account-management-spec.md 3.4.2절.
    - 옛 앱(featureUsage 없음): 각 기능 섹션의 enabled(예: {"blackbox": {"enabled": true}}) + 최상위 '...Enabled' 불값.
      옛 키 autofindV2는 뺀다.
    """
    usage = cfg.get(USAGE_KEY)
    if isinstance(usage, dict):
        out_usage: dict[str, bool | str] = {}
        for key, value in usage.items():
            if not isinstance(key, str) or not key or len(key) > 64:
                continue
            day = _usage_date(value)
            if day is None:
                continue
            out_usage[key] = day
            if len(out_usage) >= MAX_USAGE:
                break
        return out_usage

    out: dict[str, bool | str] = {}
    for key, value in cfg.items():
        if not isinstance(key, str) or len(key) > 64 or key in LEGACY_HIDDEN:
            continue
        if isinstance(value, dict) and isinstance(value.get("enabled"), bool):
            out[key] = value["enabled"]
        elif isinstance(value, bool) and key.endswith("Enabled"):
            out[key] = value
        if len(out) >= MAX_FEATURES:
            break
    return out


@dataclass
class BundleInfo:
    features: dict = field(default_factory=dict)  # extract_features 결과
    app: str | None = None                        # sync.json의 앱 버전(없거나 형식이 틀리면 None)
    character: dict = field(default_factory=dict)  # extract_character 결과(캐릭터 사용 현황, 명세 3.4.4)


MAX_PACK_LEN = 64


def extract_character(cfg: dict) -> dict:
    """캐릭터 사용 현황(명세 3.4.4) — 고른 캐릭터(voice.pack)·펫 띄우기(character.pet)·그 캐릭터 호감도.

    {"pack": str(빈 값 = 기본 목소리), "pet": bool|없음, "affinity": 0~100|없음}. 형식이 틀린 값은 뺀다.
    voice 섹션이 아예 없으면(캐릭터 기능 전 앱) 빈 dict.
    """
    out: dict = {}
    voice = cfg.get("voice")
    if isinstance(voice, dict):
        pack = voice.get("pack", "")
        if isinstance(pack, str) and len(pack) <= MAX_PACK_LEN and pack.isprintable():
            out["pack"] = pack.strip()
    ch = cfg.get("character")
    if isinstance(ch, dict):
        if isinstance(ch.get("pet"), bool):
            out["pet"] = ch["pet"]
        aff = ch.get("affinity")
        pack = out.get("pack")
        if pack and isinstance(aff, dict) and isinstance(aff.get(pack), dict):
            v = aff[pack].get("value")
            if isinstance(v, (int, float)) and not isinstance(v, bool) and 0 <= v <= 100:
                out["affinity"] = v
    return out


def _read_app_version(zf: zipfile.ZipFile) -> str | None:
    """sync.json의 "app" 값. 파일이 없거나·크거나·JSON이 아니거나·형식이 틀리면 None(업로드는 거절하지 않음)."""
    try:
        info = zf.getinfo(META_NAME)
        if info.file_size > MAX_META_BYTES:
            return None
        with zf.open(info) as f:
            raw = f.read(MAX_META_BYTES + 1)
        if len(raw) > MAX_META_BYTES:
            return None
        meta = json.loads(raw.decode("utf-8"))
    except (KeyError, zipfile.BadZipFile, RuntimeError, OSError, EOFError, UnicodeDecodeError, ValueError):
        return None
    app = meta.get("app") if isinstance(meta, dict) else None
    if not isinstance(app, str):
        return None
    app = app.strip()
    if not app or len(app) > MAX_APP_LEN or not APP_RE.match(app):
        return None
    return app


def inspect_bundle(data: bytes) -> BundleInfo:
    """올바른 설정 묶음이면 기능 사용 값·앱 버전을, 아니면 BundleError."""
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile as e:
        raise BundleError("ZIP 형식이 아니에요") from e
    with zf:
        infos = zf.infolist()
        if len(infos) > MAX_MEMBERS:
            raise BundleError("묶음 안 파일이 너무 많아요")
        total = 0
        for info in infos:
            if _bad_name(info.filename):
                raise BundleError("묶음 안에 허용되지 않는 경로가 있어요")
            total += info.file_size
        if total > MAX_UNCOMPRESSED:
            raise BundleError("묶음을 풀었을 때 크기가 너무 커요", status=413)
        try:
            cinfo = zf.getinfo(CONFIG_NAME)
        except KeyError as e:
            raise BundleError("묶음에 config.json이 없어요") from e
        if cinfo.file_size > MAX_CONFIG_BYTES:
            raise BundleError("config.json이 너무 커요", status=413)
        try:
            with zf.open(cinfo) as f:
                raw = f.read(MAX_CONFIG_BYTES + 1)  # 헤더의 크기 값이 거짓이어도 상한까지만 읽는다
        except (zipfile.BadZipFile, RuntimeError, OSError, EOFError) as e:
            raise BundleError("config.json을 읽을 수 없어요") from e
        if len(raw) > MAX_CONFIG_BYTES:
            raise BundleError("config.json이 너무 커요", status=413)
        app = _read_app_version(zf)
    try:
        cfg = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as e:
        raise BundleError("config.json이 올바른 JSON이 아니에요") from e
    if not isinstance(cfg, dict):
        raise BundleError("config.json 형식이 올바르지 않아요")
    if SECRET_KEYS & cfg.keys():
        raise BundleError("설정에 비밀값(API 키·웹훅)이 들어 있어요 — 앱에서 빼고 올려야 해요")
    return BundleInfo(features=extract_features(cfg), app=app, character=extract_character(cfg))
