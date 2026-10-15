"""Deterministic deduplication by listing_id or canonical listing URL."""

from __future__ import annotations

import hashlib
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from .models import Listing

_TRACKING_PARAMS = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"}


def canonical_url(url: str | None) -> str | None:
    if not url:
        return None
    try:
        parts = urlsplit(url.strip())
    except ValueError:
        return None
    scheme = parts.scheme.lower() or "https"
    netloc = parts.netloc.lower()
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k not in _TRACKING_PARAMS]
    query.sort()
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((scheme, netloc, path, urlencode(query), ""))


def dedupe(listings: list[Listing]) -> list[Listing]:
    """Keep the first occurrence per listing_id, falling back to canonical URL."""
    seen: set[str] = set()
    out: list[Listing] = []
    for item in listings:
        key = f"id:{item.listing_id}"
        if key in seen:
            continue
        url_key = None
        canon = canonical_url(item.listing_url)
        if canon:
            url_key = "url:" + hashlib.sha256(canon.encode()).hexdigest()
        if url_key and url_key in seen:
            continue
        seen.add(key)
        if url_key:
            seen.add(url_key)
        out.append(item)
    return out
