import json, time
from pathlib import Path
from typing import Callable


def load_or_fetch(path: Path, ttl_hours: float, fetch_fn: Callable):
    """Return cached JSON if younger than ttl_hours, else fetch + cache.

    ponytail: file mtime is the timestamp — no date-in-filename glob needed.
    On fetch failure, serve stale cache rather than nothing.
    ttl_hours=0 forces a refetch (used by --no-cache).
    """
    fresh = path.exists() and (time.time() - path.stat().st_mtime) < ttl_hours * 3600
    if fresh:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass

    try:
        data = fetch_fn()
    except Exception as e:
        if path.exists():
            print(f"fetch failed ({e}) — serving stale {path.name}")
            return json.loads(path.read_text(encoding="utf-8"))
        raise

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data


if __name__ == "__main__":
    # self-check: fresh hit skips fetch, expired triggers it
    import tempfile, os
    p = Path(tempfile.mktemp(suffix=".json"))
    calls = []
    out = load_or_fetch(p, 48, lambda: calls.append(1) or {"v": 1})
    assert out == {"v": 1} and len(calls) == 1, "first call should fetch"
    out = load_or_fetch(p, 48, lambda: calls.append(1) or {"v": 2})
    assert out == {"v": 1} and len(calls) == 1, "fresh cache should not refetch"
    os.utime(p, (0, 0))  # make it ancient
    out = load_or_fetch(p, 48, lambda: calls.append(1) or {"v": 3})
    assert out == {"v": 3} and len(calls) == 2, "expired cache should refetch"
    p.unlink()
    print("ok")
