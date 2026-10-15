from __future__ import annotations
import csv
import json
from pathlib import Path
from typing import List
import aiosqlite
from .models import ScrapedListing, RequestMetric

SQL_SCHEMA = """
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE,
    domain TEXT,
    raw_title TEXT,
    canonical_signature TEXT,
    price_raw INTEGER,
    price_currency TEXT,
    price_irt INTEGER,
    price_irr INTEGER,
    price_text TEXT,
    seller TEXT,
    timestamp TEXT,
    is_listing_page BOOLEAN,
    is_anomaly BOOLEAN,
    critical_drop BOOLEAN,
    flags_json TEXT,
    fetched_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sig ON listings(canonical_signature);
CREATE INDEX IF NOT EXISTS idx_anomaly ON listings(is_anomaly);
"""

async def persist_sqlite(db_path: str, listings: List[ScrapedListing]):
    async with aiosqlite.connect(db_path) as db:
        await db.executescript(SQL_SCHEMA)
        for l in listings:
            flags_str = json.dumps(l.flags, ensure_ascii=False)
            await db.execute(
                """
                INSERT OR REPLACE INTO listings
                (url, domain, raw_title, canonical_signature, price_raw, price_currency,
                 price_irt, price_irr, price_text, seller, timestamp, is_listing_page,
                 is_anomaly, critical_drop, flags_json, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    l.url, l.domain, l.raw_title, l.canonical_signature,
                    l.price_raw, l.price_currency_detected, l.price_irt, l.price_irr,
                    l.price_text, l.seller, l.timestamp, l.is_listing_page,
                    bool(l.flags.get("is_anomaly", False)),
                    bool(l.flags.get("critical_drop", False)),
                    flags_str, l.fetched_at
                )
            )
        await db.commit()

def export_jsonl(path: str, data: List[dict]):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("a", encoding="utf-8") as f:
        for entry in data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def export_csv(csv_path: str, listings: List[ScrapedListing]):
    p = Path(csv_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    flat = []
    for l in listings:
        d = l.model_dump()
        flags = d.pop("flags", {})
        d["is_anomaly"] = flags.get("is_anomaly")
        d["z_score"] = flags.get("z_score")
        d["mean_irt"] = flags.get("mean_irt")
        d["critical_drop"] = flags.get("critical_drop")
        flat.append(d)

    if flat:
        with open(p, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(flat[0].keys()))
            writer.writeheader()
            writer.writerows(flat)
