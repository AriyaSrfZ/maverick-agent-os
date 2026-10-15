import json
import tempfile
import unittest
from pathlib import Path
from divar_listing_ingestor.dedupe import canonical_url, dedupe
from divar_listing_ingestor.export import export_jsonl
from divar_listing_ingestor.models import Listing

def _sample(lid, url):
    return Listing(
        listing_id=lid,
        title="test",
        price_value=1000,
        currency="toman",
        location="تهران",
        category="test",
        image_count=1,
        listing_url=url,
        scraped_at_utc="2025-01-01T00:00:00Z",
        source_status="ok",
    )

class TestDedupeAndExport(unittest.TestCase):
    def test_canonical_url_strips_utm(self):
        u1 = "https://divar.ir/v/abc?utm_source=share&utm_medium=copy"
        u2 = "https://divar.ir/v/abc"
        self.assertEqual(canonical_url(u1), canonical_url(u2))

    def test_dedupe_by_id_and_canonical_url(self):
        items = [
            _sample("id1", "https://divar.ir/v/abc?utm_source=1"),
            _sample("id1", "https://divar.ir/v/abc?utm_source=2"),
            _sample("id2", "https://divar.ir/v/abc"),
            _sample("id3", "https://divar.ir/v/unique"),
        ]
        unique = dedupe(items)
        self.assertEqual(len(unique), 2)
        self.assertEqual([x.listing_id for x in unique], ["id1", "id3"])

    def test_export_jsonl(self):
        with tempfile.TemporaryDirectory() as td:
            items = [_sample("id1", "https://divar.ir/v/1"), _sample("id2", "https://divar.ir/v/2")]
            out = Path(td) / "out.jsonl"
            count = export_jsonl(items, out)
            self.assertEqual(count, 2)
            lines = out.read_text(encoding="utf-8").strip().splitlines()
            self.assertEqual(len(lines), 2)
            for line in lines:
                row = json.loads(line)
                self.assertNotIn("phone", row)
                self.assertEqual(set(row.keys()), {
                    "listing_id", "title", "price_value", "currency",
                    "location", "category", "image_count", "listing_url",
                    "scraped_at_utc", "source_status",
                })
