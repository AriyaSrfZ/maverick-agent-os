from iran_scraper.analytics.counterfeit import CounterfeitPipeline, KeywordClusterTracker


class _FakeListing:
    """Duck-typed stand-in for ScrapedListing (avoids pydantic dep in tests)."""

    def __init__(self, url="u", domain="digikala.com", raw_title="t",
                 canonical_signature="sig1", price_irt=None, price_text="",
                 fetched_at="2024-01-01T10:00:00+00:00", is_listing_page=False,
                 flags=None):
        self.url = url
        self.domain = domain
        self.raw_title = raw_title
        self.canonical_signature = canonical_signature
        self.price_irt = price_irt
        self.price_irr = None
        self.price_raw = None
        self.price_currency_detected = None
        self.price_text = price_text
        self.seller = None
        self.timestamp = None
        self.is_listing_page = is_listing_page
        self.discovered_urls_count = 0
        self.fetched_at = fetched_at
        self.flags = flags if flags is not None else {}


def test_keyword_hits_within_window_count():
    tr = KeywordClusterTracker(window_seconds=600, hit_threshold=3)
    scope = ("digikala.com", "sig1")
    tr.record(["حراج"], scope, timestamp=100.0)
    tr.record(["حراج"], scope, timestamp=300.0)
    tr.record(["حراج"], scope, timestamp=500.0)
    state = tr.window_state(scope, now=500.0)
    assert state["event_count"] == 3
    assert state["keyword_frequency"]["حراج"] == 3
    assert state["risk_flag"] is True


def test_expired_events_do_not_count():
    tr = KeywordClusterTracker(window_seconds=600, hit_threshold=3)
    scope = ("digikala.com", "sig1")
    tr.record(["حراج"], scope, timestamp=100.0)
    tr.record(["حراج"], scope, timestamp=200.0)
    state = tr.window_state(scope, now=1000.0)
    assert state["event_count"] == 0
    assert state["risk_flag"] is False


def test_scope_isolation():
    tr = KeywordClusterTracker(window_seconds=600, hit_threshold=2)
    s1 = ("digikala.com", "sig1")
    s2 = ("torob.com", "sig1")
    s3 = ("digikala.com", "sig2")
    tr.record(["حراج"], s1, timestamp=100.0)
    tr.record(["حراج"], s1, timestamp=110.0)
    for s in (s2, s3):
        state = tr.window_state(s, now=200.0)
        assert state["event_count"] == 0
    assert tr.window_state(s1, now=200.0)["event_count"] == 2


def test_cooccurrence_combinations():
    tr = KeywordClusterTracker(window_seconds=600, hit_threshold=99, cooccurrence_threshold=2)
    scope = ("torob.com", "sig9")
    tr.record(["حراج", "ارزان", "حراج"], scope, timestamp=100.0)
    tr.record(["حراج", "ارزان"], scope, timestamp=150.0)
    state = tr.window_state(scope, now=150.0)
    assert state["keyword_frequency"]["حراج"] == 2  # dedup within event
    assert state["combination_frequency"]["ارزان + حراج"] == 2
    assert state["risk_flag"] is True


def test_pipeline_buckets_are_per_platform_signature():
    p = CounterfeitPipeline(window=10, z_threshold=2.0)
    a = _FakeListing(domain="digikala.com", canonical_signature="iphone 13",
                     price_irt=50_000_000)
    b = _FakeListing(domain="torob.com", canonical_signature="iphone 13",
                     price_irt=90_000_000)
    p.evaluate(a)
    p.evaluate(b)
    keys = set(p.stats_clusters.keys())
    assert keys == {"digikala.com::iphone 13", "torob.com::iphone 13"}


def test_pipeline_fallback_without_signature():
    p = CounterfeitPipeline()
    l1 = _FakeListing(domain="torob.com", canonical_signature=None, price_irt=100)
    l2 = _FakeListing(domain="torob.com", canonical_signature=None, price_irt=100)
    p.evaluate(l1)
    p.evaluate(l2)
    assert "platform::torob.com" in p.stats_clusters
    assert l1.flags["is_anomaly"] is False


def test_pipeline_price_anomaly_flags_and_records():
    p = CounterfeitPipeline(window=50, z_threshold=2.0)
    base = dict(domain="digikala.com", canonical_signature="s")
    for pr in [100, 100, 100, 100, 100, 100]:
        p.evaluate(_FakeListing(price_irt=pr, **base))
    out = p.evaluate(_FakeListing(price_irt=20, **base))
    assert out["price_anomaly"]["is_anomaly"] is True
    assert out["price_anomaly"]["z_score"] < 0
    assert out["price_anomaly"]["bucket"] == "digikala.com::s"
    assert out["note"].startswith("Risk signal only")
    assert len(p.risk_records) == 7


def test_detect_platform_helper():
    p = CounterfeitPipeline()
    assert p.detect_platform("www.digikala.com") == "digikala"
    assert p.detect_platform("shop.example.ir") == "example"


def test_keyword_state_via_pipeline():
    p = CounterfeitPipeline()
    l = _FakeListing(raw_title="فروش فوری حراج گوشی", price_text="", canonical_signature="sig7")
    rec = p.evaluate(l)
    assert rec["keyword_hits"] == ["فروش فوری", "حراج"]
    assert rec["keyword_risk"]["signal_type"] == "marketing_anomaly_risk"
