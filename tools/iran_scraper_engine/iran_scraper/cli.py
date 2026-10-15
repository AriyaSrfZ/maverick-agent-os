from __future__ import annotations
import asyncio
import csv
import sqlite3
from pathlib import Path
from typing import List, Optional
import typer
from rich import print

from .crawler.worker import AsyncCrawlerEngine
from .storage.exporter import export_jsonl, persist_sqlite

app = typer.Typer(help="Enterprise Scraper & Counterfeit Detection CLI")

@app.command()
def crawl(
    seeds: str = typer.Option(..., help="Path to seed URLs text file"),
    depth: int = typer.Option(2, help="Max crawling BFS depth"),
    concurrency: int = typer.Option(10, help="Parallel async workers"),
    jsonl_out: str = typer.Option("output/listings.jsonl", help="JSONL listings path"),
    metrics_out: str = typer.Option("output/requests.jsonl", help="Requests log path"),
    sqlite_path: Optional[str] = typer.Option("output/market.db", help="SQLite database destination"),
    dry_run: bool = typer.Option(False, help="Simulate crawling without making external HTTP requests"),
    proxy: Optional[List[str]] = typer.Option(None, help="Proxy URLs")
):
    seed_urls = [line.strip() for line in Path(seeds).read_text(encoding="utf-8").splitlines() if line.strip()]
    engine = AsyncCrawlerEngine(
        seed_urls=seed_urls,
        max_depth=depth,
        concurrency=concurrency,
        dry_run=dry_run,
        proxies=proxy
    )

    print(f"[bold cyan]Starting Crawler: {len(seed_urls)} seeds, Depth={depth}, Dry-run={dry_run}[/bold cyan]")
    listings, metrics = asyncio.run(engine.run())

    export_jsonl(jsonl_out, [l.model_dump() for l in listings])
    export_jsonl(metrics_out, [m.model_dump() for m in metrics])
    if sqlite_path:
        asyncio.run(persist_sqlite(sqlite_path, listings))

    anomalies = [l for l in listings if l.flags.get("is_anomaly")]
    criticals = [l for l in listings if l.flags.get("critical_drop")]

    print(f"[green]✓ Completed. Processed {len(listings)} listings.[/green]")
    print(f"[yellow]⚠️ Detected Anomalies (|z| > 2σ): {len(anomalies)}[/yellow]")
    print(f"[red]🚨 Critical Fake Candidates: {len(criticals)}[/red]")

@app.command()
def export(
    sqlite_path: str = typer.Option(..., help="Source SQLite DB"),
    csv_out: str = typer.Option("output/anomalies.csv", help="Destination CSV path")
):
    conn = sqlite3.connect(sqlite_path)
    cur = conn.cursor()
    cur.execute("SELECT url, domain, canonical_signature, price_irt, price_irr, flags_json FROM listings WHERE is_anomaly = 1")
    rows = cur.fetchall()

    Path(csv_out).parent.mkdir(parents=True, exist_ok=True)
    with open(csv_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "domain", "signature", "price_irt", "price_irr", "flags"])
        writer.writerows(rows)
    print(f"[green]Exported {len(rows)} anomalies to {csv_out}[/green]")

if __name__ == "__main__":
    app()
