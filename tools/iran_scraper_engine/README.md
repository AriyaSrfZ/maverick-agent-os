# Iran Scraper Engine

Production-grade asynchronous crawler, parser, and counterfeit detection suite for Iranian e-commerce marketplaces.

## Features
- **Async aiohttp & session pooling**: High throughput with connection management.
- **Exponential backoff & Proxy rotation**: Resilient scraping with retry logic.
- **Dual-Currency Parser**: Automatically extracts and converts IRR/IRT with Persian digit support.
- **Adaptive Title Normalization**: Strips colors, warranties, RAM/storage to generate canonical product signatures.
- **Rolling Statistical Anomaly Pipeline**: Online Welford algorithm calculates running mean and standard deviation to flag > 2σ outliers.
- **Robots.txt & Dry-Run**: Safe crawling guardrails.
- **CLI & Multi-format Export**: JSONL, SQLite, and CSV output.

## Installation
```bash
pip install -e .
```

## Running tests
```bash
pytest
```

## CLI Usage
```bash
# Crawl starting from seed URLs
iran-scraper crawl --seeds seeds.txt --depth 2 --concurrency 10 --sqlite-path output/market.db

# Export detected anomalies to CSV
iran-scraper export --sqlite-path output/market.db --csv-out output/anomalies.csv
```
