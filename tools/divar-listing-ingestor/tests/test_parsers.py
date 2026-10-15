import unittest
from pathlib import Path
from divar_listing_ingestor.parser import AutoParser, HTMLFixtureParser, JSONFixtureParser

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"

class TestParsers(unittest.TestCase):
    def test_json_parser_loads_fixture(self):
        raw = (FIXTURES / "sample_listings.json").read_text(encoding="utf-8")
        listings = JSONFixtureParser().parse(raw)
        self.assertEqual(len(listings), 4)
        for item in listings:
            d = item.to_json_dict()
            self.assertNotIn("phone", d)
            self.assertNotIn("seller", d)
            self.assertNotIn("contact", d)

    def test_html_parser_loads_fixture(self):
        raw = (FIXTURES / "sample_fixture.html").read_text(encoding="utf-8")
        listings = HTMLFixtureParser().parse(raw)
        self.assertEqual(len(listings), 2)
        self.assertEqual(listings[0].listing_id, "html-post-1")
        self.assertEqual(listings[0].price_value, 25_000_000)
        self.assertEqual(listings[0].currency, "toman")
        self.assertEqual(listings[0].location, "شیراز")

    def test_auto_parser_handles_both(self):
        auto = AutoParser()
        json_listings = auto.parse((FIXTURES / "sample_listings.json").read_text(encoding="utf-8"))
        self.assertEqual(len(json_listings), 4)
        html_listings = auto.parse((FIXTURES / "sample_fixture.html").read_text(encoding="utf-8"))
        self.assertEqual(len(html_listings), 2)

    def test_malformed_inputs(self):
        self.assertEqual(JSONFixtureParser().parse("{not valid json"), [])
        self.assertEqual(HTMLFixtureParser().parse("<article>no id</article>"), [])
        self.assertEqual(AutoParser().parse(""), [])
