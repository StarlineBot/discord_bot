"""백업·복원.

  .venv/bin/python scripts/backup.py              # 백업: backups/addon-YYYYMMDD.tar.gz (7일치 보관)
  .venv/bin/python scripts/backup.py restore FILE  # 복원(먼저 서비스 중지!): 지금 data/는 data.before-restore-<시각>/ 로 옮김

백업 내용: SQLite 온라인 백업(.backup과 동일) + data/settings/*.zip. systemd 타이머가 하루 1번 실행.
"""
from __future__ import annotations

import shutil
import sys
import tarfile
import tempfile
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import BASE_DIR, load_settings  # noqa: E402
from app.db import Database  # noqa: E402

KEEP = 7
BACKUP_DIR = BASE_DIR / "backups"


def backup(settings=None, backup_dir: Path = BACKUP_DIR, keep: int = KEEP, today: str | None = None) -> Path:
    settings = settings or load_settings()
    backup_dir.mkdir(parents=True, exist_ok=True)
    name = f"addon-{today or datetime.now().strftime('%Y%m%d')}.tar.gz"
    dest = backup_dir / name
    with tempfile.TemporaryDirectory() as tmp:
        db_copy = Path(tmp) / "addon.sqlite3"
        Database(settings.db_path).backup_to(db_copy)
        part = dest.with_suffix(".part")
        with tarfile.open(part, "w:gz") as tar:
            tar.add(db_copy, arcname="addon.sqlite3")
            if settings.settings_dir.is_dir():
                for f in sorted(settings.settings_dir.glob("*.zip")):
                    tar.add(f, arcname=f"settings/{f.name}")
        part.replace(dest)
    # 오래된 것 정리: 최신 keep개만 남김
    archives = sorted(backup_dir.glob("addon-*.tar.gz"))
    for old in archives[:-keep]:
        old.unlink()
    return dest


def restore(archive: Path, settings=None) -> Path:
    """백업을 data/로 되돌린다. 기존 data/는 옮겨 두고(삭제 안 함) 경로를 돌려준다."""
    settings = settings or load_settings()
    data_dir = settings.data_dir
    with tarfile.open(archive, "r:gz") as tar:
        members = tar.getmembers()
        for m in members:  # 경로 탈출·링크 방지
            p = Path(m.name)
            if not (m.isfile() or m.isdir()) or p.is_absolute() or ".." in p.parts:
                raise ValueError(f"허용되지 않는 항목: {m.name}")
        moved = data_dir.with_name(f"{data_dir.name}.before-restore-{int(time.time())}")
        if data_dir.exists():
            shutil.move(str(data_dir), str(moved))
        data_dir.mkdir(parents=True)
        for m in members:
            if m.isdir():
                continue
            target = data_dir / m.name
            target.parent.mkdir(parents=True, exist_ok=True)
            with tar.extractfile(m) as src, open(target, "wb") as out:
                shutil.copyfileobj(src, out)
    return moved


def main() -> None:
    if len(sys.argv) >= 3 and sys.argv[1] == "restore":
        moved = restore(Path(sys.argv[2]))
        print(f"복원 완료. 이전 data는 {moved} 에 옮겨 뒀어요. 확인 후 서비스를 다시 시작하세요.")
    else:
        print(f"백업 완료: {backup()}")


if __name__ == "__main__":
    main()
