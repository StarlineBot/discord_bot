"""앱 버전(sync.json "app") 저장 — 앱 cloud_sync.build_blob 형식."""
import io
import json
import sqlite3
import zipfile

from app.bundle import inspect_bundle
from app.db import Database
from conftest import auth, login

CFG = {"blackbox": {"enabled": True}}


def bundle(meta=None, raw_meta=None):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("config.json", json.dumps(CFG))
        if raw_meta is not None:
            z.writestr("sync.json", raw_meta)
        elif meta is not None:
            z.writestr("sync.json", json.dumps(meta, ensure_ascii=False))
    return buf.getvalue()


def test_reads_app_version():
    info = inspect_bundle(bundle({"resolution": "2560x1440", "device": "PC", "app": "0.52.2", "created": 1.5}))
    assert info.app == "0.52.2" and info.features == {"blackbox": True}
    assert inspect_bundle(bundle({"app": " 0.53.0-beta.1 "})).app == "0.53.0-beta.1"


def test_missing_or_bad_sync_json_is_none():
    cases = [
        bundle(),                                   # sync.json 없음(옛 앱·가져오기 묶음)
        bundle(raw_meta="{깨진 json"),
        bundle(raw_meta="[1, 2]"),                  # dict 아님
        bundle({"device": "PC"}),                   # app 없음
        bundle({"app": ""}),                        # build_blob 기본값
        bundle({"app": 52}),
        bundle({"app": "x" * 33}),                  # 길이 초과
        bundle({"app": "0.52<script>"}),            # 허용 안 되는 글자
        bundle(raw_meta=b"\xff\xfe"),               # UTF-8 아님
        bundle({"app": "0.52.2", "pad": "x" * 20000}),  # sync.json이 너무 큼
    ]
    for data in cases:
        info = inspect_bundle(data)
        assert info.app is None and info.features == {"blackbox": True}


def put(client, token, data, rev):
    return client.put("/settings", content=data,
                      headers={**auth(token), "If-Match": rev, "Content-Type": "application/zip"})


def test_upload_saves_and_internal_shows_app(client):
    from fastapi.testclient import TestClient
    token, _ = login(client)
    assert put(client, token, bundle({"app": "0.52.2"}), "0").status_code == 200
    assert client.app.state.db.get_settings("111")["app"] == "0.52.2"
    local = TestClient(client.app, client=("127.0.0.1", 50000))
    assert local.get("/internal/users").json()["users"][0]["settings"]["app"] == "0.52.2"
    # 다음 업로드에 버전이 없으면 비운다(옛 버전이 남아 헷갈리지 않게)
    assert put(client, token, bundle(), "1").status_code == 200
    assert client.app.state.db.get_settings("111")["app"] is None


def test_migration_adds_app_column(tmp_path):
    path = tmp_path / "old.db"
    conn = sqlite3.connect(path)
    conn.executescript("""
      CREATE TABLE users (discord_id TEXT PRIMARY KEY, name TEXT NOT NULL, created TEXT NOT NULL,
        last_seen TEXT, logged_out TEXT, tier TEXT NOT NULL DEFAULT 'user', status TEXT NOT NULL DEFAULT 'active');
      CREATE TABLE settings (discord_id TEXT PRIMARY KEY, rev INTEGER NOT NULL, updated TEXT NOT NULL,
        device TEXT, resolution TEXT, size INTEGER NOT NULL, features TEXT NOT NULL DEFAULT '{}');
      INSERT INTO users VALUES ('1', 'a', 't', NULL, NULL, 'user', 'active');
      INSERT INTO settings VALUES ('1', 5, 't', 'PC', NULL, 10, '{"memo": true}');
    """)
    conn.close()
    db = Database(path)          # 시작 시 마이그레이션
    Database(path)               # 두 번 열어도 문제없음
    old = db.get_settings("1")
    assert old["app"] is None and old["rev"] == 5 and old["features"] == {"memo": True}
    assert db.save_settings("1", 5, device="PC", resolution=None, size=10, features={}, app="0.52.2") == 6
    assert db.get_settings("1")["app"] == "0.52.2"
