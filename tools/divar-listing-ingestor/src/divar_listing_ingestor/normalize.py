"""Persian/Arabic digit and price normalization utilities."""

from __future__ import annotations

import re

_DIGIT_MAP = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
}
_TRANS = str.maketrans(_DIGIT_MAP)
_SEPARATORS = re.compile(r"[،,٬\s\u200c]")
_NON_DIGIT = re.compile(r"[^0-9]")

# Currency tokens are preserved, never converted.
CURRENCY_TOKENS = {
    "toman": "toman",
    "tomān": "toman",
    "تومان": "toman",
    "ریال": "rial",
    "rial": "rial",
    "ريال": "rial",
    "IRR": "rial",
    "IRT": "toman",
    "تماس": "contact",  # "call for price": no numeric price
    "توافقی": "negotiable",
    "توافقی ": "negotiable",
    "negotiable": "negotiable",
}

WORD_NUMBERS = {
    "هزار": 1_000,
    "میلیون": 1_000_000,
    "ملیون": 1_000_000,
    "میلیارد": 1_000_000_000,
    "تومان": None,
    "ریال": None,
}


def normalize_digits(text: str) -> str:
    """Convert Persian/Arabic-Indic digits to ASCII digits."""
    return text.translate(_TRANS)


def parse_price(raw: str | None) -> tuple[int | None, str | None]:
    """Return (value, currency) from a raw price string.

    Currency is preserved as 'toman' or 'rial' and never converted.
    Returns (None, None) for missing/unparseable input.
    """
    if raw is None:
        return None, None
    text = normalize_digits(str(raw)).strip().lower()
    if not text or text in {"-", "—"}:
        return None, None

    currency: str | None = None
    for token, canon in CURRENCY_TOKENS.items():
        if token in text:
            currency = canon
            break

    cleaned = _SEPARATORS.sub("", text)
    multiplier = 1
    for word, factor in WORD_NUMBERS.items():
        if factor and word in cleaned:
            multiplier *= factor
            cleaned = cleaned.replace(word, " ")

    digits = _NON_DIGIT.sub("", cleaned)
    if not digits:
        return None, currency
    try:
        value = int(digits) * multiplier
    except ValueError:  # pragma: no cover - defensive
        return None, currency
    return value, currency


def normalize_int(raw: object) -> int | None:
    """Parse an int that may contain Persian digits or separators."""
    if raw is None:
        return None
    if isinstance(raw, int):
        return raw
    text = _SEPARATORS.sub("", normalize_digits(str(raw)))
    digits = _NON_DIGIT.sub("", text)
    return int(digits) if digits else None
