from __future__ import annotations
import asyncio
from typing import List, Set, Optional, Tuple
from ..core.http import ResilientAsyncHTTP
from ..core.robots import RobotsManager
from ..parser.engine import AdaptiveParser
from ..analytics.counterfeit import CounterfeitPipeline
from ..storage.models import ScrapedListing, RequestMetric

class AsyncCrawlerEngine:
    def __init__(
        self,
        seed_urls: List[str],
        max_depth: int = 2,
        concurrency: int = 15,
        dry_run: bool = False,
        proxies: Optional[List[str]] = None
    ):
        self.seed_urls = seed_urls
        self.max_depth = max_depth
        self.concurrency = concurrency
        self.dry_run = dry_run
        self.proxies = proxies or []
        self.frontier: asyncio.Queue[Tuple[str, int]] = asyncio.Queue()
        self.visited: Set[str] = set()
        self.pipeline = CounterfeitPipeline()

    async def run(self) -> Tuple[List[ScrapedListing], List[RequestMetric]]:
        for u in self.seed_urls:
            await self.frontier.put((u, 0))
            self.visited.add(u)

        listings: List[ScrapedListing] = []

        async with ResilientAsyncHTTP(proxies=self.proxies) as http:
            robots_gate = RobotsManager(http.headers["User-Agent"])
            sem = asyncio.Semaphore(self.concurrency)

            async def worker():
                while not self.frontier.empty():
                    url, depth = await self.frontier.get()
                    async with sem:
                        try:
                            if not await robots_gate.can_crawl(http, url):
                                continue

                            if self.dry_run:
                                continue

                            status, html, _ = await http.fetch(url)
                            if not html or status != 200:
                                continue

                            listing, discovered_urls = AdaptiveParser.parse(url, html)
                            self.pipeline.evaluate(listing)
                            listings.append(listing)

                            if depth < self.max_depth:
                                for nxt in discovered_urls:
                                    if nxt not in self.visited:
                                        self.visited.add(nxt)
                                        await self.frontier.put((nxt, depth + 1))
                        finally:
                            self.frontier.task_done()

            workers = [asyncio.create_task(worker()) for _ in range(self.concurrency)]
            await self.frontier.join()
            for w in workers:
                w.cancel()

            return listings, http.metrics
