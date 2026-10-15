from __future__ import annotations
import re
from typing import Set, Tuple
from bs4 import BeautifulSoup
from yarl import URL
from .normalizer import (
    normalize_persian_text,
    build_canonical_signature,
    extract_and_convert_currency
)
from ..storage.models import ScrapedListing
from ..utils import iso_now

LISTING_PATH_SIGNATURES = re.compile(r"/(category|search|archive|shop|products|c|cat|page|list)/?", re.IGNORECASE)
SELLER_LABEL_PATTERNS = re.compile(r"(فروشنده|تامین‌کننده|فروشگاه|عرضه‌کننده)\s*[:：]?\s*([^\n\r<]{2,40})", re.IGNORECASE)

class AdaptiveParser:
    @staticmethod
    def extract_links(base_url: str, soup: BeautifulSoup) -> Set[str]:
        origin = URL(base_url)
        discovered: Set[str] = set()
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"].strip()
            if not href or href.startswith(("javascript:", "mailto:", "tel:", "#")):
                continue
            try:
                resolved = origin.join(URL(href))
                if resolved.host == origin.host and resolved.scheme in ("http", "https"):
                    discovered.add(str(resolved))
            except Exception:
                continue
        return discovered

    @staticmethod
    def is_likely_listing_page(url: str, soup: BeautifulSoup) -> bool:
        if LISTING_PATH_SIGNATURES.search(url):
            return True
        cards = soup.find_all(class_=re.compile(r"(product-card|item-card|c-product-box|archive-item|col-)", re.I))
        return len(cards) >= 4

    @classmethod
    def parse(cls, url: str, html: str) -> Tuple[ScrapedListing, Set[str]]:
        soup = BeautifulSoup(html, "lxml")
        u = URL(url)
        domain = u.host or "unknown"
        discovered = cls.extract_links(url, soup)
        is_listing = cls.is_likely_listing_page(url, soup)

        title = None
        og_title = soup.select_one('meta[property="og:title"]')
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
        elif soup.h1:
            title = soup.h1.get_text(" ", strip=True)
        elif soup.title:
            title = soup.title.get_text(" ", strip=True)

        canonical_sig = build_canonical_signature(title)

        price_text = None
        raw_price, unit, p_irt, p_irr = None, None, None, None

        meta_price = soup.select_one('meta[property="product:price:amount"]')
        if meta_price and meta_price.get("content"):
            price_text = meta_price["content"].strip()
            raw_price, unit, p_irt, p_irr = extract_and_convert_currency(price_text)

        if not p_irt:
            candidates = []
            for tag in soup.find_all(["span", "div", "p", "b", "strong"]):
                txt = tag.get_text(" ", strip=True)
                if not txt or len(txt) > 50:
                    continue
                if any(x in txt for x in ["تومان", "ریال"]) or re.search(r"\d{1,3}(?:,\d{3})+", txt):
                    score = 0
                    if any(x in txt for x in ["تومان", "ریال"]):
                        score += 10
                    cls_id = " ".join(tag.get("class", []) + [tag.get("id", "") or ""])
                    if re.search(r"(price|amount|val|cost)", cls_id, re.I):
                        score += 8
                    candidates.append((score, txt))

            if candidates:
                candidates.sort(key=lambda x: x[0], reverse=True)
                price_text = candidates[0][1]
                raw_price, unit, p_irt, p_irr = extract_and_convert_currency(price_text)

        seller = None
        body_text = soup.get_text("\n", strip=True)
        seller_match = SELLER_LABEL_PATTERNS.search(body_text)
        if seller_match:
            seller = normalize_persian_text(seller_match.group(2))
        else:
            og_site = soup.select_one('meta[property="og:site_name"]')
            if og_site and og_site.get("content"):
                seller = og_site["content"].strip()

        timestamp = None
        time_meta = soup.select_one('meta[property="article:published_time"], meta[name="pubdate"]')
        if time_meta and time_meta.get("content"):
            timestamp = time_meta["content"]
        elif soup.find("time"):
            t_tag = soup.find("time")
            timestamp = t_tag.get("datetime") or t_tag.get_text(strip=True)

        listing = ScrapedListing(
            url=url,
            domain=domain,
            raw_title=title,
            canonical_signature=canonical_sig,
            price_raw=raw_price,
            price_currency_detected=unit,
            price_irt=p_irt,
            price_irr=p_irr,
            price_text=price_text,
            seller=seller,
            timestamp=timestamp,
            is_listing_page=is_listing,
            discovered_urls_count=len(discovered),
            fetched_at=iso_now(),
            flags={}
        )

        return listing, discovered
