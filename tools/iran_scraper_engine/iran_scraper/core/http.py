"""Production-safe HTTP layer: proxy pool, retry with exponential backoff and
jitter, structured request audit metadata, and clean session lifecycle.

No anti-detection behavior, no bypass logic; robots guardrails live in
:mod:`iran_scraper.core.robots` and are unaffected.
"""
from __future__ import annotations

import asyncio
import random
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

import aiohttp
from yarl import URL

from ..storage.models import RequestMetric
from ..utils import iso_now

RETRYABLE_STATUS_CODES = frozenset({403, 429, 500, 502, 503, 504})


def detect_platform(hostname: Optional[str]) -> str:
    """Pure helper mapping a hostname to a coarse platform label."""
    if not hostname:
        return "unknown"
    h = hostname.lower()
    for marker in ("digikala", "torob", "emalls", "zoomit", "mobit", "technolife",
                   "basalam", "modiseh", "kalaskoo", "bamilo", "digi"):
        if marker in h:
            return marker
    parts = h.split(".")
    if parts and parts[0] not in ("www", "shop", "store"):
        return parts[0]
    return parts[1] if len(parts) > 1 else h


def hostname_of(url: str) -> Optional[str]:
    try:
        return urlparse(url).hostname
    except ValueError:
        return None


@dataclass
class ProxyState:
    url: str
    failures: int = 0
    cooldown_until: float = 0.0


class ProxyPool:
    """Round-robin proxy rotation with failure cooldown and retirement.

    - Rotation is deterministic round-robin among *available* proxies.
    - A proxy that fails enters a cooldown window (exponential in failure
      count, capped by ``max_cooldown_s``).
    - After ``max_failures`` failures a proxy is retired (removed from
      rotation) until it has been idle past ``retire_reset_s`` seconds.
    - No residential-proxy sourcing or anti-detection behavior: callers pass
      explicit optional proxy URLs.
    """

    def __init__(
        self,
        proxy_urls: Optional[List[str]] = None,
        cooldown_base_s: float = 2.0,
        max_cooldown_s: float = 300.0,
        max_failures: int = 3,
        retire_reset_s: float = 900.0,
        clock: Optional[callable] = None,
    ) -> None:
        self.clock = clock or time.time
        self.states: List[ProxyState] = [ProxyState(url=u) for u in (proxy_urls or [])]
        self.cooldown_base_s = cooldown_base_s
        self.max_cooldown_s = max_cooldown_s
        self.max_failures = max_failures
        self.retire_reset_s = retire_reset_s
        self._idx = 0

    def _available(self) -> List[ProxyState]:
        now = self.clock()
        avail = []
        for st in self.states:
            if st.failures >= self.max_failures:
                if now - max(st.cooldown_until, 0.0) > self.retire_reset_s:
                    st.failures = 0  # give it another chance
                    st.cooldown_until = 0.0
                else:
                    continue
            if st.cooldown_until > now:
                continue
            avail.append(st)
        return avail

    def next_proxy(self) -> Optional[str]:
        avail = self._available()
        if not avail:
            return None
        px = avail[self._idx % len(avail)]
        self._idx += 1
        return px.url

    def report_failure(self, proxy_url: Optional[str]) -> None:
        if not proxy_url:
            return
        for st in self.states:
            if st.url == proxy_url:
                st.failures += 1
                cooldown = min(
                    self.max_cooldown_s,
                    self.cooldown_base_s * (2 ** (st.failures - 1)),
                )
                st.cooldown_until = self.clock() + cooldown
                return

    def report_success(self, proxy_url: Optional[str]) -> None:
        if not proxy_url:
            return
        for st in self.states:
            if st.url == proxy_url:
                st.failures = 0
                st.cooldown_until = 0.0
                return

    def available_count(self) -> int:
        return len(self._available())

    def is_available(self, proxy_url: str) -> bool:
        return any(st.url == proxy_url for st in self._available())


def should_retry_status(status: Optional[int], retryable: Tuple[int, ...] = tuple(RETRYABLE_STATUS_CODES)) -> bool:
    """Pure decision helper: whether an HTTP status warrants a retry."""
    return status is not None and status in retryable


def retry_delay(
    attempt: int,
    backoff_factor: float = 1.0,
    max_backoff: float = 10.0,
    retry_after: Optional[float] = None,
    jitter: Tuple[float, float] = (0.8, 1.2),
    rng: Optional[random.Random] = None,
) -> float:
    """Pure-ish backoff helper: exponential backoff with jitter.

    Honors ``Retry-After`` when provided (server-specified seconds), taking
    the larger of the server hint and our own backoff, capped by
    ``max_backoff`` unless Retry-After itself is larger.
    """
    base = backoff_factor * (2 ** attempt)
    delay = min(max_backoff, base)
    if retry_after is not None and retry_after > 0:
        delay = max(delay, float(retry_after))
    lo, hi = jitter
    return delay * (rng or random).uniform(lo, hi)


def parse_retry_after(header_value: Optional[str]) -> Optional[float]:
    """Parse a Retry-After header (HTTP-date or seconds) into seconds."""
    if not header_value:
        return None
    value = header_value.strip()
    if value.isdigit():
        return float(value)
    try:
        from email.utils import parsedate_to_datetime
        from datetime import datetime, timezone
        dt = parsedate_to_datetime(value)
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(0.0, (dt - datetime.now(timezone.utc)).total_seconds())
    except (ValueError, TypeError):
        return None


class ResilientAsyncHTTP:
    """Async HTTP client with proxy pool, retries, backoff+jitter and audit
    metadata on every attempt (timestamp, status, latency, retries, proxy,
    error). Clean context-manager session lifecycle; no private aiohttp APIs."""

    def __init__(
        self,
        timeout_s: float = 20.0,
        max_connections: int = 100,
        per_host_limit: int = 10,
        user_agent: str = "Mozilla/5.0 (compatible; EnterpriseCrawler/2.0; +https://example.ir/bot)",
        proxies: Optional[List[str]] = None,
        min_polite_delay: float = 0.2,
        max_polite_delay: float = 0.6,
        verify_ssl: bool = False,
        retry_status_codes: Tuple[int, ...] = tuple(RETRYABLE_STATUS_CODES),
    ):
        self.timeout = aiohttp.ClientTimeout(total=timeout_s)
        self.connector = aiohttp.TCPConnector(
            limit=max_connections,
            limit_per_host=per_host_limit,
            ssl=verify_ssl
        )
        self.headers = {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
        }
        self.proxy_pool = ProxyPool(proxy_urls)
        self.retry_status_codes = tuple(retry_status_codes)
        self.min_delay = min_polite_delay
        self.max_delay = max_polite_delay
        self.metrics: List[RequestMetric] = []
        self.audit_log: List[Dict] = []
        self._session: Optional[aiohttp.ClientSession] = None
        self._owns_connector = True

    async def __aenter__(self) -> "ResilientAsyncHTTP":
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                connector=self.connector,
                timeout=self.timeout,
                headers=self.headers,
                raise_for_status=False
            )
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await self.close()

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()
        self._session = None
        if self._owns_connector and self.connector and not self.connector.closed:
            await self.connector.close()

    @property
    def proxies(self) -> List[str]:
        return [st.url for st in self.proxy_pool.states]

    def _next_proxy(self) -> Optional[str]:
        return self.proxy_pool.next_proxy()

    def _audit(self, **kwargs) -> None:
        entry = {
            "timestamp": kwargs.get("timestamp", time.time()),
            "iso_time": iso_now(),
            "method": kwargs.get("method", "GET"),
            "url": kwargs.get("url"),
            "status": kwargs.get("status"),
            "elapsed_ms": round(kwargs.get("elapsed_ms", 0.0), 2),
            "attempt": kwargs.get("attempt", 0),
            "retries_used": kwargs.get("retries_used", 0),
            "proxy": kwargs.get("proxy"),
            "platform": detect_platform(hostname_of(kwargs.get("url", "") or "")),
            "error": kwargs.get("error"),
        }
        self.audit_log.append(entry)
        self.metrics.append(RequestMetric(
            timestamp=entry["timestamp"],
            iso_time=entry["iso_time"],
            method=entry["method"],
            url=entry["url"],
            status=entry["status"],
            elapsed_ms=entry["elapsed_ms"],
            proxy=entry["proxy"],
            error=entry["error"],
        ))

    async def fetch(
        self,
        url: str,
        retries: int = 3,
        backoff_factor: float = 1.0,
        max_backoff: float = 10.0
    ) -> Tuple[Optional[int], Optional[str], Optional[dict]]:
        assert self._session is not None, "ClientSession is inactive; use 'async with ResilientAsyncHTTP(...)'."
        target_url = str(URL(url))
        status_code: Optional[int] = None
        html: Optional[str] = None
        resp_headers: Optional[dict] = None
        last_error: Optional[str] = None
        total_attempts = retries + 1
        retries_used = 0

        for attempt in range(total_attempts):
            if self.max_delay > 0:
                await asyncio.sleep(random.uniform(self.min_delay, self.max_delay))

            px = self._next_proxy()
            t0 = time.perf_counter()

            try:
                async with self._session.get(target_url, proxy=px, allow_redirects=True) as response:
                    status_code = response.status
                    body = await response.read()
                    elapsed = (time.perf_counter() - t0) * 1000

                    self._audit(
                        url=target_url, status=status_code, elapsed_ms=elapsed,
                        attempt=attempt, retries_used=retries_used, proxy=px,
                    )

                    if not should_retry_status(status_code, self.retry_status_codes):
                        self.proxy_pool.report_success(px)
                        try:
                            html = body.decode("utf-8")
                        except UnicodeDecodeError:
                            html = body.decode("windows-1256", errors="replace")
                        resp_headers = dict(response.headers)
                        return status_code, html, resp_headers

                    # retryable status path
                    self.proxy_pool.report_failure(px)
                    last_error = f"retryable_status_{status_code}"
                    retries_used = attempt + 1
                    if attempt < total_attempts - 1:
                        retry_after = parse_retry_after(response.headers.get("Retry-After")) if status_code == 429 else None
                        await asyncio.sleep(retry_delay(
                            attempt, backoff_factor, max_backoff, retry_after
                        ))
                        continue
                    return status_code, None, None

            except (aiohttp.ClientError, asyncio.TimeoutError, OSError) as ex:
                elapsed = (time.perf_counter() - t0) * 1000
                last_error = repr(ex)
                self._audit(
                    url=target_url, status=None, elapsed_ms=elapsed,
                    attempt=attempt, retries_used=retries_used, proxy=px,
                    error=last_error,
                )
                self.proxy_pool.report_failure(px)
                retries_used = attempt + 1
                if attempt < total_attempts - 1:
                    await asyncio.sleep(retry_delay(attempt, backoff_factor, max_backoff))
                    continue

        return status_code, None, None
