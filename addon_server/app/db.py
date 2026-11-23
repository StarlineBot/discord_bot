"""SQLite(WAL) 저장소. 시각은 UTC ISO8601('2026-11-11T01:02:03Z').

봇(/애드온 사용자, 다음 단계)이 같은 파일을 읽기 전용으로 열 수 있게 스키마를 단순하게 유지한다.
요청마다 연결을 새로 연다(작은 서버라 비용이 거의 없고 스레드 문제를 피한다).
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created    TEXT NOT NULL,
  last_seen  TEXT,
  logged_out TEXT,
  tier       TEXT NOT NULL DEFAULT 'user',    -- user | creator
  status     TEXT NOT NULL DEFAULT 'active'   -- active | blocked(2단계)
);
CREATE TABLE IF NOT EXISTS settings (
  discord_id TEXT PRIMARY KEY REFERENCES users(discord_id),
  rev        INTEGER NOT NULL,
  updated    TEXT NOT NULL,
  device     TEXT,
  resolution TEXT,
  size       INTEGER NOT NULL,
  features   TEXT NOT NULL DEFAULT '{}',     -- 기능 사용 값: 새 앱 {"blackbox": "2026-11-18"}(마지막 사용일) / 옛 앱 {"blackbox": true}
  app        TEXT                            -- 올린 앱 버전(sync.json "app"), 모르면 NULL
);
-- 비로그인 설정 올리기(명세 3.4.3, 사용 현황 보기용). 묶음(ZIP)은 검사만 하고 저장하지 않는다(받아 가는 주소가 없음).
-- IP·PC 이름도 저장하지 않는다. install_id = 앱 설치마다 무작위 hex.
CREATE TABLE IF NOT EXISTS guests (
  install_id TEXT PRIMARY KEY,
  updated    TEXT NOT NULL,
  resolution TEXT,
  size       INTEGER NOT NULL,
  features   TEXT NOT NULL DEFAULT '{}',
  app        TEXT
);
CREATE INDEX IF NOT EXISTS guests_updated ON guests(updated);
"""

# 기존 DB에 나중에 추가된 컬럼: (테이블, 컬럼, 정의). 시작할 때 없으면 ALTER TABLE ADD COLUMN.
MIGRATIONS = [
    ("settings", "app", "TEXT"),
]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Database:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.executescript(SCHEMA)
            self._migrate(conn)

    @staticmethod
    def _migrate(conn) -> None:
        for table, column, decl in MIGRATIONS:
            cols = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})")}
            if column not in cols:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {decl}")

    @contextmanager
    def connect(self):
        """성공 시 커밋, 예외 시 롤백, 항상 닫는다."""
        conn = sqlite3.connect(self.path, timeout=5)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA busy_timeout=5000")
        conn.execute("PRAGMA synchronous=NORMAL")
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    # ── users ──
    def upsert_login(self, discord_id: str, name: str, tier: str) -> dict:
        """로그인 성공: 없으면 만들고, 이름·등급·마지막 접속 갱신, 로그아웃 표시 해제."""
        ts = now_iso()
        with self.connect() as conn:
            conn.execute(
                """INSERT INTO users(discord_id, name, created, last_seen, logged_out, tier)
                   VALUES(?, ?, ?, ?, NULL, ?)
                   ON CONFLICT(discord_id) DO UPDATE SET
                     name=excluded.name, last_seen=excluded.last_seen, logged_out=NULL, tier=excluded.tier""",
                (discord_id, name, ts, ts, tier),
            )
            return dict(conn.execute("SELECT * FROM users WHERE discord_id=?", (discord_id,)).fetchone())

    def get_user(self, discord_id: str) -> dict | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM users WHERE discord_id=?", (discord_id,)).fetchone()
            return dict(row) if row else None

    def touch(self, discord_id: str, tier: str) -> None:
        with self.connect() as conn:
            conn.execute("UPDATE users SET last_seen=?, tier=? WHERE discord_id=?", (now_iso(), tier, discord_id))

    def mark_logged_out(self, discord_id: str) -> None:
        with self.connect() as conn:
            conn.execute("UPDATE users SET logged_out=? WHERE discord_id=?", (now_iso(), discord_id))

    # ── settings ──
    def get_settings(self, discord_id: str) -> dict | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM settings WHERE discord_id=?", (discord_id,)).fetchone()
            if not row:
                return None
            out = dict(row)
            out["features"] = json.loads(out["features"] or "{}")
            return out

    def save_settings(self, discord_id: str, expected_rev: int, *, device: str | None,
                      resolution: str | None, size: int, features: dict, app: str | None = None) -> int | None:
        """expected_rev가 현재 rev와 같을 때만 저장하고 새 rev를 돌려준다. 다르면 None(충돌)."""
        ts = now_iso()
        feats = json.dumps(features, ensure_ascii=False, sort_keys=True)
        with self.connect() as conn:
            conn.execute("BEGIN IMMEDIATE")  # rev 확인~저장을 한 트랜잭션으로(동시 업로드 경합 방지)
            row = conn.execute("SELECT rev FROM settings WHERE discord_id=?", (discord_id,)).fetchone()
            current = row["rev"] if row else 0
            if current != expected_rev:
                return None
            new_rev = current + 1
            conn.execute(
                """INSERT INTO settings(discord_id, rev, updated, device, resolution, size, features, app)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(discord_id) DO UPDATE SET rev=excluded.rev, updated=excluded.updated,
                     device=excluded.device, resolution=excluded.resolution, size=excluded.size,
                     features=excluded.features, app=excluded.app""",
                (discord_id, new_rev, ts, device, resolution, size, feats, app),
            )
            return new_rev

    # ── guests(비로그인) ──
    def save_guest(self, install_id: str, *, resolution: str | None, size: int, features: dict,
                   app: str | None, max_rows: int) -> None:
        """덮어쓰기(rev·충돌 없음). 행이 max_rows를 넘으면 오래된 것부터 지운다."""
        feats = json.dumps(features, ensure_ascii=False, sort_keys=True)
        with self.connect() as conn:
            conn.execute(
                """INSERT INTO guests(install_id, updated, resolution, size, features, app)
                   VALUES(?, ?, ?, ?, ?, ?)
                   ON CONFLICT(install_id) DO UPDATE SET updated=excluded.updated, resolution=excluded.resolution,
                     size=excluded.size, features=excluded.features, app=excluded.app""",
                (install_id, now_iso(), resolution, size, feats, app),
            )
            conn.execute("""DELETE FROM guests WHERE install_id IN (
                              SELECT install_id FROM guests ORDER BY updated DESC LIMIT -1 OFFSET ?)""", (max_rows,))

    def get_guest(self, install_id: str) -> dict | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM guests WHERE install_id=?", (install_id,)).fetchone()
            if not row:
                return None
            out = dict(row)
            out["features"] = json.loads(out["features"] or "{}")
            return out

    def backup_to(self, dest: Path) -> None:
        """온라인 백업(sqlite3 backup API = .backup 명령과 동일)."""
        dest = Path(dest)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dst = sqlite3.connect(dest)
        try:
            with self.connect() as src:
                src.backup(dst)
        finally:
            dst.close()
