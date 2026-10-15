import random
from iran_scraper.core.http import (
    ProxyPool,
    detect_platform,
    hostname_of,
    parse_retry_after,
    retry_delay,
    should_retry_status,
)


def test_proxy_pool_round_robin():
    pool = ProxyPool(["http://p1", "http://p2", "http://p3"])
    assert pool.next_proxy() == "http://p1"
    assert pool.next_proxy() == "http://p2"
    assert pool.next_proxy() == "http://p3"
    assert pool.next_proxy() == "http://p1"


def test_proxy_pool_cooldown_on_failure():
    now = 1000.0

    def fake_clock():
        return now

    pool = ProxyPool(["http://p1", "http://p2"], cooldown_base_s=10.0, clock=fake_clock)
    p = pool.next_proxy()
    pool.report_failure(p)  # p1 in cooldown until 1010.0
    assert pool.next_proxy() == "http://p2"
    assert pool.next_proxy() == "http://p2"  # p1 still cooling down

    now = 1011.0  # pass cooldown
    seen = {pool.next_proxy(), pool.next_proxy()}
    assert seen == {"http://p1", "http://p2"}


def test_proxy_pool_retirement_after_max_failures():
    now = 100.0

    def fake_clock():
        return now

    pool = ProxyPool(["http://bad", "http://good"], max_failures=2, clock=fake_clock)
    pool.report_failure("http://bad")
    pool.report_failure("http://bad")  # now retired
    now = 1000.0  # past cooldown, but still within retire_reset_s
    assert pool.next_proxy() == "http://good"
    assert pool.next_proxy() == "http://good"


def test_proxy_pool_report_success_clears_failures():
    pool = ProxyPool(["http://p1"])
    pool.report_failure("http://p1")
    assert pool.states[0].failures == 1
    pool.report_success("http://p1")
    assert pool.states[0].failures == 0
    assert pool.states[0].cooldown_until == 0.0


def test_should_retry_status():
    assert should_retry_status(429) is True
    assert should_retry_status(503) is True
    assert should_retry_status(403) is True
    assert should_retry_status(200) is False
    assert should_retry_status(404) is False
    assert should_retry_status(None) is False


def test_retry_delay_exponential_with_jitter():
    rng = random.Random(42)
    d0 = retry_delay(0, backoff_factor=1.0, max_backoff=10.0, jitter=(1.0, 1.0), rng=rng)
    d1 = retry_delay(1, backoff_factor=1.0, max_backoff=10.0, jitter=(1.0, 1.0), rng=rng)
    d2 = retry_delay(2, backoff_factor=1.0, max_backoff=10.0, jitter=(1.0, 1.0), rng=rng)
    assert d0 == 1.0
    assert d1 == 2.0
    assert d2 == 4.0


def test_retry_delay_honors_retry_after():
    d = retry_delay(0, backoff_factor=1.0, max_backoff=10.0, retry_after=7.5, jitter=(1.0, 1.0))
    assert d == 7.5


def test_parse_retry_after():
    assert parse_retry_after("120") == 120.0
    assert parse_retry_after(None) is None
    assert parse_retry_after("invalid") is None


def test_platform_and_hostname_helpers():
    assert hostname_of("https://torob.com/p/123") == "torob.com"
    assert detect_platform("digikala.com") == "digikala"
    assert detect_platform("sub.technolife.ir") == "technolife"
