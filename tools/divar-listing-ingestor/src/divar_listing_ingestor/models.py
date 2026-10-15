"""Data model containing only non-sensitive listing fields.

Deliberately excludes any seller contact information (phones, chat handles, etc.).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass

ALLOWED_FIELDS = frozenset(
    {
        "listing_id",
        "title",
        "price_value",
        "currency",
        "location",
        "category",
        "image_count",
        "listing_url",
        "scraped_at_utc",
        "source_status",
    }
)


@dataclass(frozen=True)
class Listing:
    listing_id: str
    title: str | None
    price_value: int | None
    currency: str | None  # preserved verbatim; never converted toman/rial
    location: str | None
    category: str | None
    image_count: int | None
    listing_url: str | None
    scraped_at_utc: str
    source_status: str  # "ok" | "parsed_with_errors"

    def to_json_dict(self) -> dict[str, object]:
        data = asdict(self)
        assert set(data) == set(ALLOWED_FIELDS), "schema drift detected"
        return data
