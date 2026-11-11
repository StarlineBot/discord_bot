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
