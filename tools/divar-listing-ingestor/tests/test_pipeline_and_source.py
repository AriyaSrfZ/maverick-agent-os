import os
import tempfile
import unittest
from pathlib import Path
from divar_listing_ingestor.pipeline import run
from divar_listing_ingestor.source import AuthorizedEndpointSource, LocalFixtureSource

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"

class TestPipelineAndSource(unittest.TestCase):
    def test_pipeline_local_run(self):
        with tempfile.TemporaryDirectory() as td:
            source = LocalFixtureSource(FIXTURES / "sample_listings.json")
            out = Path(td) / "out.jsonl"
            count = run(source, output=str(out))
            self.assertEqual(count, 3)
            self.assertTrue(out.exists())

    def test_authorized_endpoint_source_requires_opt_in(self):
        src = AuthorizedEndpointSource("http://example.com/listings")
        with self.assertRaises(PermissionError):
            src.read()

    def test_authorized_endpoint_source_requires_env_flag(self):
        src = AuthorizedEndpointSource("http://example.com/listings", allow_network=True)
        old = os.environ.pop("DIVAR_INGEST_ALLOW_NETWORK", None)
        try:
            with self.assertRaises(PermissionError):
                src.read()
        finally:
            if old is not None:
                os.environ["DIVAR_INGEST_ALLOW_NETWORK"] = old
