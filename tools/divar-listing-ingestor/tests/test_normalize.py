import unittest
from divar_listing_ingestor.normalize import normalize_digits, normalize_int, parse_price

class TestNormalize(unittest.TestCase):
    def test_persian_digit_conversion(self):
        self.assertEqual(normalize_digits("۰۱۲۳۴۵۶۷۸۹"), "0123456789")
        self.assertEqual(normalize_digits("٠١٢٣٤٥٦٧٨٩"), "0123456789")
        self.assertEqual(normalize_digits("تهران ۱۲۳"), "تهران 123")

    def test_price_parsing_toman_and_rial_preserved(self):
        val, curr = parse_price("۳٬۵۰۰٬۰۰۰٬۰۰۰ تومان")
        self.assertEqual(val, 3_500_000_000)
        self.assertEqual(curr, "toman")

        val2, curr2 = parse_price("450,000,000 ریال")
        self.assertEqual(val2, 450_000_000)
        self.assertEqual(curr2, "rial")

    def test_price_word_multipliers(self):
        val, curr = parse_price("۳ میلیون تومان")
        self.assertEqual(val, 3_000_000)
        self.assertEqual(curr, "toman")

        val_b2, _ = parse_price("۲ میلیارد تومان")
        self.assertEqual(val_b2, 2_000_000_000)

    def test_price_non_numeric_and_empty(self):
        val, curr = parse_price("توافقی")
        self.assertIsNone(val)
        self.assertEqual(curr, "negotiable")

        val, curr = parse_price(None)
        self.assertIsNone(val)
        self.assertIsNone(curr)

        val, curr = parse_price("")
        self.assertIsNone(val)
        self.assertIsNone(curr)

    def test_normalize_int(self):
        self.assertEqual(normalize_int("۱۲"), 12)
        self.assertEqual(normalize_int(42), 42)
        self.assertIsNone(normalize_int("abc"))
        self.assertIsNone(normalize_int(None))
