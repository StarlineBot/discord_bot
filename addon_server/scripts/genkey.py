"""앱 토큰 서명 키 만들기/공개 키 보기.

  .venv/bin/python scripts/genkey.py            # 새 키: TOKEN_SIGNING_KEY 줄 + 공개 키 출력
  .venv/bin/python scripts/genkey.py --public   # .env의 비밀 키에서 공개 키만 다시 출력

비밀 키(TOKEN_SIGNING_KEY)는 addon_server/.env 에만 두고(권한 600) 절대 공유하지 않는다.
공개 키는 앱 코드에 넣는다(공개해도 안전).
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import load_settings  # noqa: E402
from app.tokens import TokenSigner, generate_seed_b64  # noqa: E402


def main() -> None:
    if "--public" in sys.argv:
        seed = load_settings().token_signing_key
        if not seed:
            sys.exit("addon_server/.env 에 TOKEN_SIGNING_KEY가 없어요")
    else:
        seed = generate_seed_b64()
        print("# ↓ addon_server/.env 에 넣으세요 (비밀, 공유 금지)")
        print(f"TOKEN_SIGNING_KEY={seed}\n")
    signer = TokenSigner(seed)
    print("# ↓ 앱에 넣을 공개 키 (공개해도 안전)")
    print(f"raw(base64): {signer.public_key_b64()}")
    print(signer.public_key_pem())


if __name__ == "__main__":
    main()
