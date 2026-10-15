from __future__ import annotations
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ScrapedListing(BaseModel):
    url: str
    domain: str
    raw_title: Optional[str] = None
    canonical_signature: Optional[str] = None
    price_raw: Optional[int] = None
    price_currency_detected: Optional[str] = None  # 'IRT', 'IRR', or 'UNKNOWN'
    price_irt: Optional[int] = None
    price_irr: Optional[int] = None
    price_text: Optional[str] = None
    seller: Optional[str] = None
    timestamp: Optional[str] = None
    is_listing_page: bool = False
    discovered_urls_count: int = 0
    fetched_at: str
    flags: Dict[str, Any] = Field(default_factory=dict)

class RequestMetric(BaseModel):
    timestamp: float
    iso_time: str
    method: str
    url: str
    status: Optional[int]
    elapsed_ms: float
    proxy: Optional[str]
    error: Optional[str] = None
