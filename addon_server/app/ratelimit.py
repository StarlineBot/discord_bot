"""메모리 기반 고정 창(1분) 요청 제한. 프로세스 1개라 이걸로 충분하다."""
from __future__ import annotations

import time


class RateLimiter:
    def __init__(self, limit: int, window: float = 60.0, max_keys: int = 10000):
        self.limit = limit
        self.window = window
        self.max_keys = max_keys
        self._hits: dict[str, tuple[float, int]] = {}

    def hit(self, key: str, now: float | None = None) -> bool:
        """허용이면 True. 창 안에서 limit를 넘으면 False."""
        t = time.monotonic() if now is None else now
        start, count = self._hits.get(key, (t, 0))
        if t - start >= self.window:
            start, count = t, 0
        count += 1
        self._hits[key] = (start, count)
        if len(self._hits) > self.max_keys:  # 오래된 창 정리(메모리 상한)
            self._hits = {k: v for k, v in self._hits.items() if t - v[0] < self.window}
        return count <= self.limit
