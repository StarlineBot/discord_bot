"""디스코드 OAuth2 Authorization Code 흐름(scope identify). client secret은 서버에만."""
from __future__ import annotations

from urllib.parse import urlencode

import httpx

AUTHORIZE_URL = "https://discord.com/oauth2/authorize"
TOKEN_URL = "https://discord.com/api/oauth2/token"
ME_URL = "https://discord.com/api/users/@me"


class DiscordError(Exception):
    pass


class DiscordOAuth:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str, timeout: float = 10.0):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.timeout = timeout

    def authorize_url(self, state: str) -> str:
        return AUTHORIZE_URL + "?" + urlencode({
            "response_type": "code", "client_id": self.client_id, "scope": "identify",
            "redirect_uri": self.redirect_uri, "state": state, "prompt": "none",
        })

    async def fetch_user(self, code: str) -> dict:
        """인증 코드 교환 → 사용자 조회. {'id': str, 'name': str}"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            r = await client.post(TOKEN_URL, data={
                "grant_type": "authorization_code", "code": code, "redirect_uri": self.redirect_uri,
            }, auth=(self.client_id, self.client_secret),
                headers={"Content-Type": "application/x-www-form-urlencoded"})
            if r.status_code != 200:
                raise DiscordError(f"코드 교환 실패({r.status_code})")
            access = r.json().get("access_token")
            if not access:
                raise DiscordError("access_token 없음")
            r = await client.get(ME_URL, headers={"Authorization": f"Bearer {access}"})
            if r.status_code != 200:
                raise DiscordError(f"사용자 조회 실패({r.status_code})")
            me = r.json()
        uid = str(me.get("id") or "")
        if not uid.isdigit():
            raise DiscordError("사용자 ID 없음")
        name = me.get("global_name") or me.get("username") or uid
        return {"id": uid, "name": str(name)[:64]}
