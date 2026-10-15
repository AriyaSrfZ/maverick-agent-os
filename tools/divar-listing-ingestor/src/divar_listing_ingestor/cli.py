"""CLI for parsing local fixtures and exporting JSONL. Offline by default."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .logging_conf import configure_logging
from .pipeline import run
from .source import LocalFixtureSource


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="divar-ingest",
        description="Privacy-preserving, fixture-based listing ingestion (offline by default).",
    )
    p.add_argument("fixture", type=Path, help="path to a local HTML/JSON/JSONL fixture file")
    p.add_argument("-o", "--output", default="output.jsonl", help="output JSONL path")
    p.add_argument(
        "--parser",
        choices=("auto", "json", "html"),
        default="auto",
        help="parser to use (default: auto-detect)",
    )
    p.add_argument("-v", "--verbose", action="store_true", help="debug logging")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    configure_logging(args.verbose)
    try:
        source = LocalFixtureSource(args.fixture)
        count = run(source, parser_name=args.parser, output=str(args.output))
    except FileNotFoundError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # noqa: BLE001 - CLI boundary
        print(f"error: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    print(f"wrote {count} listings to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
