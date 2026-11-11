"""설정 로딩: addon_server/.env + 환경변수(환경변수가 우선)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # addon_server/


def _load_env_file(path: Path) -> dict[str, str]:
    """KEY=VALUE 형식의 단순 .env 파서(따옴표 제거, # 주석 무시)."""
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        values[key.strip()] = value
    return values


@dataclass
class Settings:
    discord_client_id: str = ""
    discord_client_secret: str = ""
    public_base_url: str = "https://starline-bot.duckdns.org"
    token_signing_key: str = ""  # Ed25519 seed(32바이트) base64
    creator_ids: frozenset[str] = field(default_factory=frozenset)
    data_dir: Path = BASE_DIR / "data"
    token_ttl_days: int = 30
    max_settings_bytes: int = 2 * 1024 * 1024
    rate_limit_per_min: int = 60

    @property
    def redirect_uri(self) -> str:
        return self.public_base_url.rstrip("/") + "/auth/callback"

    @property
    def db_path(self) -> Path:
        return self.data_dir / "addon.sqlite3"

    @property
    def settings_dir(self) -> Path:
        return self.data_dir / "settings"


def load_settings(env_file: Path | None = None) -> Settings:
    file_values = _load_env_file(env_file if env_file is not None else BASE_DIR / ".env")

    def get(key: str, default: str = "") -> str:
        return os.environ.get(key, file_values.get(key, default)).strip()

    data_dir = Path(get("DATA_DIR", "data"))
    if not data_dir.is_absolute():
        data_dir = BASE_DIR / data_dir
    return Settings(
        discord_client_id=get("DISCORD_CLIENT_ID"),
        discord_client_secret=get("DISCORD_CLIENT_SECRET"),
        public_base_url=get("PUBLIC_BASE_URL", "https://starline-bot.duckdns.org"),
        token_signing_key=get("TOKEN_SIGNING_KEY"),
        creator_ids=frozenset(x.strip() for x in get("CREATOR_IDS").split(",") if x.strip()),
        data_dir=data_dir,
        token_ttl_days=int(get("TOKEN_TTL_DAYS", "30")),
        max_settings_bytes=int(get("MAX_SETTINGS_BYTES", str(2 * 1024 * 1024))),
        rate_limit_per_min=int(get("RATE_LIMIT_PER_MIN", "60")),
    )
