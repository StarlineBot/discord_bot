"""설정 묶음(ZIP) 검사 + 기능 사용 값 추출.

앱의 config.export_bundle 형식: ZIP 안에 config.json(설정) + userdata/…(직접 집은 아이콘 등).
서버는 묶음을 풀지 않고 그대로 보관한다. 여기서는 형식·크기·경로만 확인하고 config.json만 읽는다.
"""
from __future__ import annotations

import io
import json
import zipfile
from pathlib import PurePosixPath

CONFIG_NAME = "config.json"
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


def extract_features(cfg: dict) -> dict[str, bool]:
    """기능 사용 값: 각 기능 섹션의 enabled(예: {"blackbox": {"enabled": true}}) + 최상위 '...Enabled' 불값."""
    out: dict[str, bool] = {}
    for key, value in cfg.items():
        if not isinstance(key, str) or len(key) > 64:
            continue
        if isinstance(value, dict) and isinstance(value.get("enabled"), bool):
            out[key] = value["enabled"]
        elif isinstance(value, bool) and key.endswith("Enabled"):
            out[key] = value
        if len(out) >= MAX_FEATURES:
            break
    return out


def inspect_bundle(data: bytes) -> dict[str, bool]:
    """올바른 설정 묶음이면 기능 사용 값을, 아니면 BundleError."""
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
    try:
        cfg = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as e:
        raise BundleError("config.json이 올바른 JSON이 아니에요") from e
    if not isinstance(cfg, dict):
        raise BundleError("config.json 형식이 올바르지 않아요")
    if SECRET_KEYS & cfg.keys():
        raise BundleError("설정에 비밀값(API 키·웹훅)이 들어 있어요 — 앱에서 빼고 올려야 해요")
    return extract_features(cfg)
