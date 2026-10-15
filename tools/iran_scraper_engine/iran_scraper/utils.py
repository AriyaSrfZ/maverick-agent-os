from __future__ import annotations
from datetime import datetime, timezone

def iso_now() -> str:
    """Return current ISO-8601 UTC timestamp."""
    return datetime.now(timezone.utc).isoformat()
