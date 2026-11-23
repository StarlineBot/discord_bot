import sqlite3

from fastapi.testclient import TestClient

from app.main import create_app
from app.ratelimit import RateLimiter
from conftest import FakeDiscord, auth, login, make_bundle
from scripts.backup import backup, restore


def test_health(client):
    assert client.get("/health").json() == {"ok": True}


def test_rate_limit_per_user(settings):
    settings.rate_limit_per_min = 5
    c = TestClient(create_app(settings, discord=FakeDiscord()))
    token, _ = login(c)
    codes = [c.get("/settings", headers=auth(token)).status_code for _ in range(7)]
    assert codes[:5] == [200] * 5 and codes[5:] == [429, 429]


def test_rate_limiter_window_resets():
    rl = RateLimiter(2, window=60)
    assert rl.hit("k", now=0) and rl.hit("k", now=1) and not rl.hit("k", now=2)
    assert rl.hit("k", now=61)


def test_wal_mode(client, settings):
    with sqlite3.connect(settings.db_path) as conn:
        assert conn.execute("PRAGMA journal_mode").fetchone()[0] == "wal"


def test_backup_and_restore(client, settings, tmp_path):
    token, _ = login(client)
    data = make_bundle()
    client.put("/settings", content=data, headers={**auth(token), "If-Match": "0"})
    bdir = tmp_path / "backups"
    archive = backup(settings, backup_dir=bdir, today="20261111")
    assert archive.name == "addon-20261111.tar.gz"
    # 7일치만 보관
    for d in range(1, 10):
        backup(settings, backup_dir=bdir, today=f"202611{d:02d}")
    assert len(list(bdir.glob("addon-*.tar.gz"))) == 7
    # 데이터가 망가졌다고 치고 복원
    (settings.settings_dir / "111.zip").write_bytes(b"broken")
    moved = restore(archive, settings)
    assert moved.exists()
    assert (settings.settings_dir / "111.zip").read_bytes() == data
    with sqlite3.connect(settings.db_path) as conn:
        assert conn.execute("SELECT rev FROM settings WHERE discord_id='111'").fetchone()[0] == 1
        assert conn.execute("SELECT name FROM users WHERE discord_id='111'").fetchone()[0] == "유저"


def test_internal_users_local_only(settings):
    from conftest import make_bundle
    app = create_app(settings, discord=FakeDiscord())
    outside = TestClient(app)  # TestClient 기본 주소 'testclient' = 외부
    token, _ = login(outside)
    outside.put("/settings", content=make_bundle(), headers={**auth(token), "If-Match": "0"}, params={"device": "PC"})
    assert outside.get("/internal/users").status_code == 403
    local = TestClient(app, client=("127.0.0.1", 50000))
    body = local.get("/internal/users").json()
    u = body["users"][0]
    assert u["discord_id"] == "111" and u["name"] == "유저" and u["settings"]["rev"] == 1
    assert u["settings"]["device"] == "PC" and u["settings"]["features"]["blackbox"] is True
    # Caddy를 거친 요청(X-Forwarded-For)은 내부 주소처럼 보여도 거절
    assert local.get("/internal/users", headers={"X-Forwarded-For": "1.2.3.4"}).status_code == 403
