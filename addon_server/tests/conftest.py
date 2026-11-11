import io
import json
import zipfile
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.tokens import generate_seed_b64

CREATOR = "280290004926857216"


class FakeDiscord:
    """디스코드 대역: 코드 → 사용자. 'bad' 코드는 실패."""

    def __init__(self):
        self.users = {"code-user": {"id": "111", "name": "유저"}, "code-creator": {"id": CREATOR, "name": "제작자"}}

    def authorize_url(self, state):
        return f"https://discord.test/authorize?state={state}"

    async def fetch_user(self, code):
        if code not in self.users:
            from app.discord_oauth import DiscordError
            raise DiscordError("bad code")
        return self.users[code]


@pytest.fixture
def settings(tmp_path):
    return Settings(token_signing_key=generate_seed_b64(), data_dir=tmp_path / "data",
                    creator_ids=frozenset({CREATOR}), rate_limit_per_min=1000)


@pytest.fixture
def client(settings):
    return TestClient(create_app(settings, discord=FakeDiscord()))


def login(client, code="code-user", app_state="appstate1234", port=53123):
    """로그인 흐름 전체를 돌려 (토큰, 최종 리다이렉트 쿼리)를 돌려준다."""
    r = client.get("/auth/start", params={"state": app_state, "port": port}, follow_redirects=False)
    assert r.status_code == 302
    server_state = parse_qs(urlparse(r.headers["location"]).query)["state"][0]
    r = client.get("/auth/callback", params={"state": server_state, "code": code}, follow_redirects=False)
    assert r.status_code == 302, r.text
    loc = urlparse(r.headers["location"])
    return parse_qs(loc.query).get("token", [None])[0], loc


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def make_bundle(cfg=None, extra=None):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("config.json", json.dumps(cfg if cfg is not None else
                                             {"blackbox": {"enabled": True}, "cursorFx": {"enabled": False},
                                              "theme": "dark", "voiceEnabled": True}))
        for name, data in (extra or {}).items():
            z.writestr(name, data)
    return buf.getvalue()
