"""Counterfeit *risk-signal* analytics.

Two cooperating pieces:

1. :class:`CounterfeitPipeline` - price anomaly detection. Buckets are
   per-(platform, canonical signature) when those fields are available so
   unrelated products are never averaged together; safe fallbacks to
   signature-only or domain-only keys are provided.
2. :class:`KeywordClusterTracker` - time-windowed suspicious-keyword
   co-occurrence tracking per scope.

All outputs are structured risk records. These are marketing/pricing anomaly
signals, NOT proof of counterfeit goods.
"""
from __future__ import annotations

import re
from collections import Counter, defaultdict, deque
from typing import Any, Deque, Dict, Iterable, List, Optional, Sequence, Tuple

from .stats import WelfordRollingStats
from ..storage.models import ScrapedListing

KEYWORDS = [
    r"\bویژه\b",
    r"\bتخفیفی\b",
    r"\bپک\s*تخفیف\b",
    r"\bحراج\b",
    r"\bفروش\s*فوری\b",
    r"\bزیر\s*قیمت\b",
    r"\bارزان\b",
]
KW_COMPILED = re.compile("|".join(KEYWORDS))

SUSPICIOUS_PHRASES: Tuple[str, ...] = (
    "حراج", "فروش فوری", "زیر قیمت", "تخفیفی", "ویژه", "ارزان", "پک تخفیف",
    "نسخه اصلی", "اورجینال", "کپی", "های کپی", "درجه یک", "درجه یک اصل",
)


def _dedup_preserve_order(items: Iterable[str]) -> List[str]:
    seen: set = set()
    out: List[str] = []
    for it in items:
        k = re.sub(r"\s+", " ", it.strip())
        if k and k.lower() not in seen:
            seen.add(k.lower())
            out.append(k)
    return out


def _iso_to_epoch(ts: Optional[str]) -> Optional[float]:
    if not ts:
        return None
    try:
        from datetime import datetime
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
    except (ValueError, TypeError):
        return None


class KeywordClusterTracker:
    """Tracks suspicious keyword hits and combinations over a time window.

    Events are scoped by (platform, signature); expired events are ignored.
    All timestamps are epoch seconds derived from ISO strings.
    """

    def __init__(
        self,
        window_seconds: float = 3600.0,
        hit_threshold: int = 3,
        cooccurrence_threshold: int = 2,
    ) -> None:
        self.window_seconds = float(window_seconds)
        self.hit_threshold = int(hit_threshold)
        self.cooccurrence_threshold = int(cooccurrence_threshold)
        # scope -> deque of (epoch, [keywords])
        self._events: Dict[Tuple[str, str], Deque[Tuple[float, List[str]]]] = defaultdict(deque)

    @staticmethod
    def make_scope(platform: Optional[str], signature: Optional[str]) -> Tuple[str, str]:
        return (platform or "unknown", signature or "unknown")

    def record(
        self,
        keywords: Sequence[str],
        scope: Tuple[str, str],
        timestamp: Optional[float] = None,
        now: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Record a keyword hit event; returns the current window state."""
        import time as _time
        epoch = float(timestamp) if timestamp is not None else (now if now is not None else _time.time())
        kws = _dedup_preserve_order(keywords)
        dq = self._events[scope]
        dq.append((epoch, kws))
        # prune expired
        cutoff = epoch - self.window_seconds
        while dq and dq[0][0] < cutoff:
            dq.popleft()
        return self.window_state(scope, now=epoch)

    def window_state(self, scope: Tuple[str, str], now: Optional[float] = None) -> Dict[str, Any]:
        import time as _time
        ref = now if now is not None else _time.time()
        dq = self._events.get(scope, deque())
        recent = [(t, kws) for (t, kws) in dq if t >= ref - self.window_seconds]
        freq: Counter = Counter()
        combo_freq: Counter = Counter()
        first_ts = last_ts = None
        for _, kws in recent:
            freq.update(set(kws))
            if len(kws) >= 2:
                combo = " + ".join(sorted(set(kws)))
                combo_freq[combo] += 1
            if first_ts is None or _ < first_ts:
                first_ts = _
            if last_ts is None or _ > last_ts:
                last_ts = _
        return {
            "scope": {"platform": scope[0], "signature": scope[1]},
            "event_count": len(recent),
            "keyword_frequency": dict(freq),
            "combination_frequency": dict(combo_freq),
            "first_seen": first_ts,
            "last_seen": last_ts,
            "window_seconds": self.window_seconds,
            "risk_flag": (
                len(recent) >= self.hit_threshold
                or any(v >= self.cooccurrence_threshold for v in combo_freq.values())
            ),
            "signal_type": "marketing_anomaly_risk",
            "note": "Risk signal only; not proof of counterfeit goods.",
        }

    def evaluate_listing(self, listing: ScrapedListing) -> Optional[Dict[str, Any]]:
        text = f"{listing.raw_title or ''} {listing.price_text or ''}"
        hits = _dedup_preserve_order(KW_COMPILED.findall(text))
        if not hits:
            return None
        scope = self.make_scope(getattr(listing, "domain", None), listing.canonical_signature)
        ts = _iso_to_epoch(listing.fetched_at)
        return self.record(hits, scope, timestamp=ts)


class CounterfeitPipeline:
    """Price anomaly + keyword risk pipeline.

    Per-(platform, canonical_signature) buckets prevent global averaging of
    unrelated products; fallback buckets use signature or domain only.
    """

    def __init__(
        self,
        window: int = 150,
        z_threshold: float = 2.0,
        keyword_window_seconds: float = 3600.0,
        keyword_hit_threshold: int = 3,
        keyword_cooccurrence_threshold: int = 2,
    ):
        self.window = window
        self.z_threshold = z_threshold
        self.stats_clusters: Dict[str, WelfordRollingStats] = {}
        self.keyword_clusters: Counter = Counter()
        self.time_series_keywords: Dict[str, Counter] = defaultdict(Counter)
        self.keyword_tracker = KeywordClusterTracker(
            window_seconds=keyword_window_seconds,
            hit_threshold=keyword_hit_threshold,
            cooccurrence_threshold=keyword_cooccurrence_threshold,
        )
        self.risk_records: List[Dict[str, Any]] = []

    @staticmethod
    def _bucket_key(listing: ScrapedListing) -> str:
        platform = getattr(listing, "domain", None)
        signature = listing.canonical_signature
        if platform and signature:
            return f"{platform}::{signature}"
        if signature and signature != "unknown_signature":
            return f"sig::{signature}"
        if platform:
            return f"platform::{platform}"
        return "fallback::unknown"

    @staticmethod
    def detect_platform(hostname: Optional[str]) -> str:
        """Small pure helper mapping a hostname to a coarse platform label."""
        if not hostname:
            return "unknown"
        h = hostname.lower()
        for marker in ("digikala", "torob", "emalls", "zoomit", "mobit", "technolife",
                       "esam", "basalam", "okala", "snapp", "bamilo", "modiseh",
                       "kalaskoo", "moshaks", "digi"):
            if marker in h:
                return marker
        parts = [p for p in h.split(".") if p]
        skipped = {"www", "shop", "store", "market"}
        core = [p for p in parts if p not in skipped]
        return (core[0] if core else (parts[1] if len(parts) > 1 else h))

    def evaluate(self, listing: ScrapedListing) -> Dict[str, Any]:
        """Evaluate one listing. Returns a structured risk record and also
        stores it on ``self.risk_records``. Legacy flags on the listing are
        preserved/updated for backward compatibility."""
        text_corpus = f"{listing.raw_title or ''} {listing.price_text or ''}"
        found_kw = _dedup_preserve_order(KW_COMPILED.findall(text_corpus))
        if found_kw:
            self.keyword_clusters.update(found_kw)
            day_slot = (listing.fetched_at or "")[:10]
            self.time_series_keywords[day_slot].update(found_kw)

        listing.flags["suspicious_keywords"] = found_kw

        kw_state = self.keyword_tracker.evaluate_listing(listing)

        platform = self.detect_platform(getattr(listing, "domain", None))
        listing.flags["platform"] = platform

        record: Dict[str, Any] = {
            "url": listing.url,
            "platform": platform,
            "bucket": self._bucket_key(listing),
            "canonical_signature": listing.canonical_signature,
            "keyword_hits": found_kw,
            "keyword_risk": kw_state,
            "price_anomaly": None,
        }

        is_anomaly = False
        if not listing.price_irt or listing.is_listing_page:
            listing.flags["is_anomaly"] = False
        else:
            bucket_key = self._bucket_key(listing)
            if bucket_key not in self.stats_clusters:
                self.stats_clusters[bucket_key] = WelfordRollingStats(self.window)

            cluster = self.stats_clusters[bucket_key]
            mu, std = cluster.stats()

            if mu is not None and std is not None and std == 0 and listing.price_irt != mu:
                # Uniform bucket: any deviation is a strong signal; use a
                # small relative epsilon so the z-score stays finite.
                eps = max(abs(mu) * 0.05, 1.0)
                z_score = (listing.price_irt - mu) / eps
                is_anomaly = abs(z_score) > self.z_threshold
                listing.flags.update({
                    "mean_irt": round(mu, 2),
                    "std_irt": 0.0,
                    "z_score": round(z_score, 2),
                    "is_anomaly": is_anomaly,
                    "critical_drop": bool(
                        z_score < -self.z_threshold and len(found_kw) > 0
                    ),
                })
            elif mu is not None and std is not None and std > 0:
                z_score = (listing.price_irt - mu) / std
                is_anomaly = abs(z_score) > self.z_threshold
                listing.flags.update({
                    "mean_irt": round(mu, 2),
                    "std_irt": round(std, 2),
                    "z_score": round(z_score, 2),
                    "is_anomaly": is_anomaly,
                    "critical_drop": bool(
                        z_score < -self.z_threshold and len(found_kw) > 0
                    ),
                })
            else:
                listing.flags.update({
                    "mean_irt": listing.price_irt,
                    "std_irt": 0.0,
                    "z_score": 0.0,
                    "is_anomaly": False,
                    "critical_drop": False,
                })

            record["price_anomaly"] = {
                "bucket": bucket_key,
                "mean_irt": listing.flags.get("mean_irt"),
                "std_irt": listing.flags.get("std_irt"),
                "z_score": listing.flags.get("z_score"),
                "is_anomaly": is_anomaly,
                "critical_drop": listing.flags.get("critical_drop", False),
            }

            cluster.add(float(listing.price_irt))

        record["is_anomaly"] = is_anomaly
        record["note"] = "Risk signal only; not proof of counterfeit goods."
        self.risk_records.append(record)
        return record

    def keyword_window_snapshot(self) -> Dict[str, Dict[str, Any]]:
        return {
            f"{p}::{s}": self.keyword_tracker.window_state((p, s))
            for (p, s) in self.keyword_tracker._events
        }
