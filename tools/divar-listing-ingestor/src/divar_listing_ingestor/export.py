"""Deterministic JSONL export with stable key ordering."""

from __future__ import annotations

import json
from pathlib import Path

from .models import ALLOWED_FIELDS, Listing

FIELD_ORDER = sorted(ALLOWED_FIELDS)


def export_jsonl(listings: list[Listing], path: str | Path) -> int:
    """Write listings as JSONL; returns count written. Deterministic output."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with p.open("w", encoding="utf-8", newline="\n") as f:
        for item in listings:
            data = item.to_json_dict()
            ordered = {k: data[k] for k in FIELD_ORDER}
            f.write(json.dumps(ordered, ensure_ascii=False, sort_keys=True) + "\n")
            count += 1
    return count
