"""Offline-safe ingestion pipeline: source -> parse -> dedupe -> export."""

from __future__ import annotations

import logging

from .dedupe import dedupe
from .export import export_jsonl
from .parser import get_parser
from .source import LocalFixtureSource

logger = logging.getLogger(__name__)


def run(source: LocalFixtureSource, parser_name: str = "auto", output: str = "output.jsonl") -> int:
    raw = source.read()
    parser = get_parser(parser_name)
    listings = parser.parse(raw)
    if not listings:
        logger.warning("no_listings_parsed")
    unique = dedupe(listings)
    logger.info("parsed", extra={"raw_count": len(listings), "unique_count": len(unique)})
    return export_jsonl(unique, output)
