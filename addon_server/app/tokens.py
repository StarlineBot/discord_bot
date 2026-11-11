"""앱 토큰: Ed25519 서명 JWT(alg=EdDSA).

서버만 비밀 키(seed)를 갖고, 앱은 공개 키로 서명만 확인한다 → config.json을 고쳐 로그인·제작자 흉내 불가.
클레임: iss=starline-bot, aud=mabinogi-addon, sub=디스코드 ID, name, tier(user|creator), iat, exp.
"""
from __future__ import annotations

import base64
import time

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

ISSUER = "starline-bot"
AUDIENCE = "mabinogi-addon"
KEY_ID = "k1"  # 키 교체 시 올린다(앱은 kid별 공개 키를 가질 수 있음)


class TokenError(Exception):
    pass


def generate_seed_b64() -> str:
    """새 비밀 키(seed 32바이트) base64."""
    key = Ed25519PrivateKey.generate()
    raw = key.private_bytes(serialization.Encoding.Raw, serialization.PrivateFormat.Raw,
                            serialization.NoEncryption())
    return base64.b64encode(raw).decode()


class TokenSigner:
    def __init__(self, seed_b64: str, ttl_days: int = 30):
        try:
            seed = base64.b64decode(seed_b64, validate=True)
        except Exception as e:  # noqa: BLE001
            raise ValueError("TOKEN_SIGNING_KEY가 올바른 base64가 아니에요") from e
        if len(seed) != 32:
            raise ValueError("TOKEN_SIGNING_KEY는 32바이트 Ed25519 seed(base64)여야 해요 — scripts/genkey.py로 만드세요")
        self._private = Ed25519PrivateKey.from_private_bytes(seed)
        self._public = self._private.public_key()
        self.ttl_seconds = ttl_days * 86400

    def issue(self, discord_id: str, name: str, tier: str, now: int | None = None) -> tuple[str, int]:
        iat = int(time.time()) if now is None else now
        exp = iat + self.ttl_seconds
        claims = {"iss": ISSUER, "aud": AUDIENCE, "sub": discord_id, "name": name, "tier": tier,
                  "iat": iat, "exp": exp}
        token = jwt.encode(claims, self._private, algorithm="EdDSA", headers={"kid": KEY_ID})
        return token, exp

    def verify(self, token: str) -> dict:
        try:
            return jwt.decode(token, self._public, algorithms=["EdDSA"], issuer=ISSUER, audience=AUDIENCE,
                              options={"require": ["exp", "iat", "sub", "iss", "aud"]})
        except jwt.ExpiredSignatureError as e:
            raise TokenError("토큰이 만료됐어요") from e
        except jwt.PyJWTError as e:
            raise TokenError("토큰이 올바르지 않아요") from e

    def public_key_pem(self) -> str:
        return self._public.public_bytes(serialization.Encoding.PEM,
                                         serialization.PublicFormat.SubjectPublicKeyInfo).decode()

    def public_key_b64(self) -> str:
        raw = self._public.public_bytes(serialization.Encoding.Raw, serialization.PublicFormat.Raw)
        return base64.b64encode(raw).decode()
