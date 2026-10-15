import tempfile
import unittest
from pathlib import Path
from divar_listing_ingestor.cli import main

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"

class TestCLI(unittest.TestCase):
    def test_cli_success(self):
        with tempfile.TemporaryDirectory() as td:
            out = Path(td) / "cli_out.jsonl"
            rc = main([str(FIXTURES / "sample_listings.json"), "-o", str(out)])
            self.assertEqual(rc, 0)
            self.assertTrue(out.is_file())

    def test_cli_missing_file(self):
        rc = main(["fixtures/does_not_exist.json"])
        self.assertEqual(rc, 2)
