import time
from urllib.parse import parse_qs

import jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from app.tokens import AUDIENCE, ISSUER, TokenSigner, generate_seed_b64
from conftest import CREATOR, auth, login


def test_login_flow_issues_signed_token(client, settings):
    token, loc = login(client)
    assert loc.scheme == "http" and loc.hostname == "localhost" and loc.port == 53123 and loc.path == "/callback"
    assert parse_qs(loc.query)["state"] == ["appstate1234"]  # 앱 state 그대로 돌려줌
    claims = TokenSigner(settings.token_signing_key).verify(token)
    assert claims["sub"] == "111" and claims["name"] == "유저" and claims["tier"] == "user"
    assert claims["exp"] - claims["iat"] == 30 * 86400
    user = client.app.state.db.get_user("111")
    assert user["last_seen"] and user["logged_out"] is None


def test_creator_tier_from_server_list(client):
    token, _ = login(client, code="code-creator")
    r = client.get("/me", headers=auth(token))
    assert r.json()["tier"] == "creator"


def test_start_validates_state_and_port(client):
    assert client.get("/auth/start", params={"state": "short", "port": 53123}, follow_redirects=False).status_code == 400
    assert client.get("/auth/start", params={"state": "a" * 12, "port": 80}, follow_redirects=False).status_code == 400
    assert client.get("/auth/start", params={"state": "bad state!!", "port": 53123}, follow_redirects=False).status_code == 400


def test_callback_unknown_or_reused_state(client):
    r = client.get("/auth/callback", params={"state": "nope", "code": "code-user"}, follow_redirects=False)
    assert r.status_code == 400
    # 같은 state를 두 번 쓸 수 없음
    r = client.get("/auth/start", params={"state": "appstate1234"}, follow_redirects=False)
    st = parse_qs(r.headers["location"].split("?")[1])["state"][0]
    assert client.get("/auth/callback", params={"state": st, "code": "code-user"}, follow_redirects=False).status_code == 302
    assert client.get("/auth/callback", params={"state": st, "code": "code-user"}, follow_redirects=False).status_code == 400


def test_callback_denied_and_failed(client):
    r = client.get("/auth/start", params={"state": "appstate1234"}, follow_redirects=False)
    st = parse_qs(r.headers["location"].split("?")[1])["state"][0]
    r = client.get("/auth/callback", params={"state": st, "error": "access_denied"}, follow_redirects=False)
    assert "error=access_denied" in r.headers["location"] and "state=appstate1234" in r.headers["location"]
    token, loc = login(client, code="bad")
    assert token is None and parse_qs(loc.query)["error"] == ["login_failed"]


def test_requests_without_or_with_bad_token_rejected(client, settings):
    login(client)
    for method, path in [("get", "/me"), ("get", "/settings"), ("get", "/settings/blob"), ("put", "/settings"),
                         ("post", "/auth/logout")]:
        assert getattr(client, method)(path).status_code == 401, path
    # 다른 키로 서명한 위조 토큰
    forged = jwt.encode({"iss": ISSUER, "aud": AUDIENCE, "sub": "111", "name": "x", "tier": "creator",
                         "iat": int(time.time()), "exp": int(time.time()) + 999},
                        Ed25519PrivateKey.generate(), algorithm="EdDSA")
    assert client.get("/me", headers=auth(forged)).status_code == 401
    # 만료 토큰(진짜 키)
    old, _ = TokenSigner(settings.token_signing_key, 30).issue("111", "유저", "user", now=int(time.time()) - 31 * 86400)
    assert client.get("/me", headers=auth(old)).status_code == 401
    # 서명 없는(alg=none) 토큰
    none_tok = jwt.encode({"iss": ISSUER, "aud": AUDIENCE, "sub": "111", "iat": 1, "exp": 9999999999},
                          key=None, algorithm="none")
    assert client.get("/me", headers=auth(none_tok)).status_code == 401
    # 진짜 키로 서명했지만 DB에 없는 사용자
    ghost, _ = TokenSigner(settings.token_signing_key).issue("999", "유령", "user")
    assert client.get("/me", headers=auth(ghost)).status_code == 401


def test_me_refreshes_token_and_recomputes_tier(client, settings):
    token, _ = login(client)
    # 토큰에 creator라고 적혀 있어도 서버 목록에 없으면 user
    fake_creator, _ = TokenSigner(settings.token_signing_key).issue("111", "유저", "creator")
    body = client.get("/me", headers=auth(fake_creator)).json()
    assert body["tier"] == "user"
    new = TokenSigner(settings.token_signing_key).verify(body["token"])
    assert new["tier"] == "user" and body["expiresAt"] == new["exp"]


def test_logout_records(client):
    token, _ = login(client)
    assert client.post("/auth/logout", headers=auth(token)).status_code == 204
    assert client.app.state.db.get_user("111")["logged_out"]
    login(client)  # 다시 로그인하면 해제
    assert client.app.state.db.get_user("111")["logged_out"] is None


def test_blocked_user(client):
    token, _ = login(client)
    with client.app.state.db.connect() as conn:
        conn.execute("UPDATE users SET status='blocked' WHERE discord_id='111'")
    assert client.get("/me", headers=auth(token)).status_code == 403
    _, loc = login(client)
    assert parse_qs(loc.query)["error"] == ["blocked"]


def test_invalid_signing_key_rejected():
    import pytest
    with pytest.raises(ValueError):
        TokenSigner("not-base64!!")
    with pytest.raises(ValueError):
        TokenSigner(generate_seed_b64()[:10])


def test_creator_constant():
    assert CREATOR == "280290004926857216"
