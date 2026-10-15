from iran_scraper.analytics.stats import WelfordRollingStats

def test_welford_rolling_stats():
    stats = WelfordRollingStats(window_size=5)
    for x in [10.0, 20.0, 30.0, 40.0, 50.0]:
        stats.add(x)

    mu, std = stats.stats()
    assert mu == 30.0
    assert round(std, 2) == 15.81
