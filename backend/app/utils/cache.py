"""In-memory TTL cache for district-level API responses (MVP)."""

import time
from typing import Any


class TTLCache:
    """Simple dict-based cache with TTL. Redis-compatible interface for production swap."""

    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        """Get a cached value. Returns None if expired or missing."""
        if key in self._store:
            value, expiry = self._store[key]
            if time.time() < expiry:
                return value
            else:
                del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        """Store a value with TTL in seconds."""
        self._store[key] = (value, time.time() + ttl_seconds)

    def delete(self, key: str) -> None:
        """Delete a cached key."""
        self._store.pop(key, None)

    def clear(self) -> None:
        """Clear all cached entries."""
        self._store.clear()

    def cleanup(self) -> int:
        """Remove expired entries. Returns count of removed entries."""
        now = time.time()
        expired = [k for k, (_, exp) in self._store.items() if now >= exp]
        for k in expired:
            del self._store[k]
        return len(expired)


# Singleton cache instance
cache = TTLCache()
