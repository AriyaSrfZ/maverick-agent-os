"""Pluggable parser protocol plus HTML and JSON fixture parsers."""

from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from typing import Protocol

from .models import Listing
from .normalize import normalize_digits, normalize_int, parse_price

logger = logging.getLogger(__name__)

ID_KEYS = ("listing_id", "id", "token", "post_id")
TITLE_KEYS = ("title",)
PRICE_KEYS = ("price", "price_value", "price_text", "vazn_price")
CURRENCY_KEYS = ("currency", "price_currency")
LOCATION_KEYS = ("location", "city", "city_name", "district", "city_slug")
CATEGORY_KEYS = ("category", "category_name", "category_slug", "kind")
IMAGE_KEYS = ("image_count", "images", "image_urls", "photos")
URL_KEYS = ("listing_url", "url", "web_url", "share_url", "slug")


class Parser(Protocol):
    def parse(self, raw: str) -> list[Listing]:  # pragma: no cover - protocol
        ...


def _now_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _first(d: dict, keys: tuple[str, ...]) -> object:
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return None


def _coerce_str(v: object) -> str | None:
    if v is None:
        return None
    s = normalize_digits(str(v)).strip()
    return s or None


def listing_from_record(rec: dict) -> Listing | None:
    if not isinstance(rec, dict):
        return None
    lid = _coerce_str(_first(rec, ID_KEYS))
    if not lid:
        logger.warning("record_skipped_missing_id")
        return None
    price_raw = _first(rec, PRICE_KEYS)
    if isinstance(price_raw, dict):
        price_raw = price_raw.get("value") or price_raw.get("text")
    price_value, currency = parse_price(price_raw if isinstance(price_raw, (str, int)) else None)
    if currency is None and isinstance(price_raw, (str, int)):
        # No explicit currency token: keep None rather than guessing toman/rial.
        currency = None
    explicit_currency = _coerce_str(_first(rec, CURRENCY_KEYS))
    if explicit_currency:
        c = explicit_currency.lower()
        if "toman" in c or "تومان" in c:
            currency = "toman"
        elif "rial" in c or "ریال" in c:
            currency = "rial"
        elif c in {"toman", "rial"}:
            currency = c
        else:
            currency = explicit_currency  # preserve verbatim

    images = _first(rec, IMAGE_KEYS)
    if isinstance(images, (list, tuple)):
        image_count = len(images)
    elif isinstance(images, dict):
        image_count = len(images)
    else:
        image_count = normalize_int(images)
    if image_count is not None and image_count < 0:
        image_count = None

    url = _coerce_str(_first(rec, URL_KEYS))
    return Listing(
        listing_id=lid,
        title=_coerce_str(_first(rec, TITLE_KEYS)),
        price_value=price_value,
        currency=currency,
        location=_coerce_str(_first(rec, LOCATION_KEYS)),
        category=_coerce_str(_first(rec, CATEGORY_KEYS)),
        image_count=image_count,
        listing_url=url,
        scraped_at_utc=_coerce_str(_first(rec, ("scraped_at_utc",))) or _now_utc(),
        source_status="ok",
    )


class _HTMLTextExtractor(HTMLParser):
    """Minimal, dependency-free structured extractor for simple fixture HTML.

    Expects either JSON inside <script type="application/json"> blocks, or
    repeated <article data-listing-id=...> elements with data-* attributes.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.json_blobs: list[str] = []
        self.articles: list[dict] = []
        self._in_json = False
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        d = {k: (v or "") for k, v in attrs}
        if tag == "script" and "application/json" in d.get("type", ""):
            self._in_json = True
            self._buf = []
        if tag in {"article", "div", "li"} and any(k.startswith("data-") for k in d):
            if d.get("data-listing-id") or d.get("data-id"):
                self.articles.append({k[5:].replace("-", "_"): v for k, v in d.items() if k.startswith("data-")})

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_json:
            self._in_json = False
            self.json_blobs.append("".join(self._buf))

    def handle_data(self, data: str) -> None:
        if self._in_json:
            self._buf.append(data)


_PRICE_IN_TEXT = re.compile(r"[\d\u06F0-\u06F9][\d\u06F0-\u06F9,،٬\s]*")


class HTMLFixtureParser:
    """Parser for authorized HTML fixtures (offline only)."""

    def parse(self, raw: str) -> list[Listing]:
        ext = _HTMLTextExtractor()
        try:
            ext.feed(raw)
        except Exception as exc:  # html.parser is lenient, but be safe
            logger.warning("html_parse_error", extra={"error": str(exc)})
            return []
        out: list[Listing] = []
        for blob in ext.json_blobs:
            try:
                data = json.loads(blob)
            except json.JSONDecodeError:
                continue
            out.extend(self._from_json_obj(data))
        for art in ext.articles:
            rec: dict = {"listing_id": art.get("listing_id") or art.get("id")}
            rec["title"] = art.get("title")
            price_text = art.get("price")
            if price_text is not None:
                rec["price"] = price_text
                if "تومان" in price_text or "toman" in price_text.lower():
                    rec["currency"] = "toman"
                elif "ریال" in price_text or "rial" in price_text.lower():
                    rec["currency"] = "rial"
            rec["location"] = art.get("city") or art.get("location")
            rec["category"] = art.get("category")
            rec["image_count"] = art.get("image_count")
            rec["listing_url"] = art.get("url") or art.get("listing_url")
            listing = listing_from_record(rec)
            if listing:
                out.append(listing)
        return out

    def _from_json_obj(self, data: object) -> list[Listing]:
        if isinstance(data, list):
            return [l for r in data if (l := listing_from_record(r))]
        if isinstance(data, dict):
            for key in ("posts", "listings", "items", "data", "results"):
                if isinstance(data.get(key), list):
                    return [l for r in data[key] if (l := listing_from_record(r))]
        return []


class JSONFixtureParser:
    """Parser for authorized JSON/JSONL fixtures (offline only)."""

    def parse(self, raw: str) -> list[Listing]:
        out: list[Listing] = []
        stripped = raw.strip()
        if not stripped:
            return []
        # Try JSONL first (multiple non-empty lines each being JSON).
        lines = [ln for ln in stripped.splitlines() if ln.strip()]
        if len(lines) > 1:
            ok = True
            tmp: list[Listing] = []
            for ln in lines:
                try:
                    obj = json.loads(ln)
                except json.JSONDecodeError:
                    ok = False
                    break
                if (l := listing_from_record(obj)):
                    tmp.append(l)
            if ok:
                return tmp
        try:
            obj = json.loads(stripped)
        except json.JSONDecodeError as exc:
            logger.warning("json_parse_error", extra={"error": str(exc)})
            return []
        if isinstance(obj, list):
            for r in obj:
                if (l := listing_from_record(r)):
                    out.append(l)
        elif isinstance(obj, dict):
            for key in ("posts", "listings", "items", "data", "results"):
                if isinstance(obj.get(key), list):
                    for r in obj[key]:
                        if (l := listing_from_record(r)):
                            out.append(l)
                    return out
            if (l := listing_from_record(obj)):
                out.append(l)
        return out


def get_parser(name: str) -> Parser:
    """Pluggable parser registry (auto-detect fallback)."""
    if name == "html":
        return HTMLFixtureParser()
    if name == "json":
        return JSONFixtureParser()
    if name == "auto":
        return AutoParser()
    raise ValueError(f"unknown parser: {name!r}")


class AutoParser:
    """Tries JSON, then HTML, deterministically."""

    def parse(self, raw: str) -> list[Listing]:
        s = raw.lstrip()
        if s.startswith("{") or s.startswith("["):
            result = JSONFixtureParser().parse(raw)
            if result:
                return result
        return HTMLFixtureParser().parse(raw)
