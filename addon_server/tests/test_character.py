"""캐릭터 사용 현황(명세 3.4.4) — 업로드 때 voice.pack·character.pet·그 캐릭터 호감도만 뽑아 저장."""
import io
import json
import zipfile

from fastapi.testclient import TestClient

from app.bundle import extract_character
from app.main import create_app
from conftest import FakeDiscord, auth, login

PACK = "조용한 여성"


def cfg(pack=PACK, pet=True, value=30, **extra):
    c = {"voice": {"pack": pack}, "character": {"pet": pet, "affinity": {pack: {"value": value}, "다른 팩": {"value": 99}}}}
    c.update(extra)
    return c


def bundle(c):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("config.json", json.dumps(c, ensure_ascii=False))
    return buf.getvalue()


def test_extract_character():
    assert extract_character(cfg()) == {"pack": PACK, "pet": True, "affinity": 30}  # 고른 캐릭터 호감도만
    assert extract_character(cfg(pack="")) == {"pack": "", "pet": True}  # 기본 목소리 → 호감도 없음
    assert extract_character({}) == {}  # 캐릭터 기능 전 앱
    assert extract_character({"voice": {}, "character": {}}) == {"pack": ""}


def test_extract_character_ignores_bad_values():
    assert extract_character({"voice": {"pack": 3}, "character": {"pet": "yes"}}) == {}
    assert extract_character({"voice": "x", "character": []}) == {}
    assert extract_character(cfg(pack="x" * 65)) == {"pet": True}
    for bad in (-1, 101, "30", True, None):
        assert "affinity" not in extract_character(cfg(value=bad)), bad
    assert extract_character(cfg(value=100))["affinity"] == 100
    assert extract_character(cfg(value=24.5))["affinity"] == 24.5


def test_saved_for_login_and_guest(client):
    token, _ = login(client)
    r = client.put("/settings", content=bundle(cfg()), headers={**auth(token), "If-Match": "0"})
    assert r.status_code == 200, r.text
    assert client.app.state.db.get_settings("111")["character"] == {"pack": PACK, "pet": True, "affinity": 30}
    iid = "a" * 32
    r = client.put("/guest/settings", content=bundle(cfg(pack="", pet=False)), headers={"X-Install-Id": iid})
    assert r.status_code == 204
    assert client.app.state.db.get_guest(iid)["character"] == {"pack": "", "pet": False}
    local = TestClient(client.app, client=("127.0.0.1", 50000)).get("/internal/users").json()
    assert local["users"][0]["settings"]["character"]["pack"] == PACK
    assert local["guests"][0]["character"] == {"pack": "", "pet": False}


def test_backfill_from_stored_bundle(settings):
    app = create_app(settings, FakeDiscord())
    db = app.state.db
    db.upsert_login("1", "a", "user")
    db.save_settings("1", 0, device=None, resolution=None, size=1, features={})  # 칸 생기기 전처럼 character NULL
    (settings.settings_dir / "1.zip").write_bytes(bundle(cfg(value=80)))
    db.upsert_login("2", "b", "user")
    db.save_settings("2", 0, device=None, resolution=None, size=1, features={})  # 묶음 파일 없음 → 그대로 둠
    assert db.get_settings("1")["character"] is None
    create_app(settings, FakeDiscord())  # 서버 다시 시작 → 채움
    assert db.get_settings("1")["character"] == {"pack": PACK, "pet": True, "affinity": 80}
    assert db.get_settings("2")["character"] is None
