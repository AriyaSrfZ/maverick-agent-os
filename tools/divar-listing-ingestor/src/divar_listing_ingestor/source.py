"""Data sources: local files (default, offline) and an opt-in authorized endpoint.

Network access is DISABLED by default. The AuthorizedEndpointSource requires an
explicit opt-in via allow_network=True AND DIVAR_INGEST_ALLOW_NETWORK=1 in the
environment. It performs a single bounded request with no retries and never
interacts with challenges or protections.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.request
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 10.0


class LocalFixtureSource:
    """Reads a local HTML/JSON/JSONL fixture file. No network."""

    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)

    def read(self) -> str:
        if not self.path.is_file():
            raise FileNotFoundError(f"fixture not found: {self.path}")
        return self.path.read_text(encoding="utf-8")


class AuthorizedEndpointSource:
    """Fetches data from an EXPLICITLY authorized endpoint.

    Disabled unless both allow_network=True and DIVAR_INGEST_ALLOW_NETWORK=1.
    Single bounded request; no retry loops; no challenge handling.
    """

    def __init__(self, url: str, allow_network: bool = False, timeout: float = DEFAULT_TIMEOUT) -> None:
        self.url = url
        self.timeout = timeout
        self.allow_network = allow_network

    def read(self) -> str:
        env_flag = os.environ.get("DIVAR_INGEST_ALLOW_NETWORK", "0") == "1"
        if not (self.allow_network and env_flag):
            raise PermissionError(
                "network disabled: pass allow_network=True and set DIVAR_INGEST_ALLOW_NETWORK=1 "
                "and only use with endpoints you are explicitly authorized to access"
            )
        req = urllib.request.Request(
            self.url,
            headers={"User-Agent": "divar-listing-ingestor/1.0 (authorized-use)"},
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:  # noqa: S310 (authorized URL)
            if resp.status != 200:
                raise RuntimeError(f"endpoint returned HTTP {resp.status}")
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.read().decode(charset, errors="replace")


def fixture_manifest(path: str | Path) -> dict:
    """Optionally load a manifest describing fixture provenance/authorization."""
    p = Path(path)
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
