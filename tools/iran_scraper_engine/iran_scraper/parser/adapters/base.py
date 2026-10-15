from __future__ import annotations
from typing import Protocol, Tuple, Set
from ...storage.models import ScrapedListing

class BaseAdapter(Protocol):
    key: str
    def can_handle(self, domain: str) -> bool: ...
    def extract(self, url: str, html: str) -> Tuple[ScrapedListing, Set[str]]: ...
