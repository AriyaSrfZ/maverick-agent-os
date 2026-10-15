"""Persian/Arabic/Latin text normalization, canonical signature building and
deterministic, stdlib-only fuzzy title grouping.

All behavior of the previous version (digit translation, IRR/IRT conversion,
noise-term stripping) is preserved and extended with:
- Unicode variant folding (Arabic Yeh/Kaf variants, heh variants, ZWNJ handling)
- Configurable noise terms (colors, warranty, storage/RAM variants)
- Deterministic token-based similarity/grouping helpers (token Jaccard +
  conservative character similarity / containment rule)
"""
from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple

# ---------------------------------------------------------------------------
# Character level normalization tables
# ---------------------------------------------------------------------------

PERSIAN_TO_ENGLISH_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

ARABIC_CHAR_FIXES = str.maketrans({
    "ي": "ی", "ك": "ک", "ة": "ه", "ۀ": "ه",
    "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",  # alef variants fold
    "ؤ": "و", "ئ": "ی",
    "٫": ".", "٬": ",", "،": ",",
    "؟": "?", "؛": ";",
})

# Zero-width joiners / soft hyphen and other invisible characters
_INVISIBLE_RE = re.compile(r"[\u200b\u200e\u200f\ufeff\u00ad]")

RE_PRICE_EXTRACT = re.compile(
    r"(?<!\d)(\d{1,3}(?:[,\s\.\u066C]\d{3})+|\d+)\s*(تومان|ریال|ت|ر)?",
    re.IGNORECASE
)

# ---------------------------------------------------------------------------
# Noise terms (configurable)
# ---------------------------------------------------------------------------

DEFAULT_NOISE_TERMS: Tuple[str, ...] = (
    # colors
    "مشکی", "سفید", "آبی", "قرمز", "طلایی", "نقره", "نقره ای", "خاکستری",
    "سبز", "رزگلد", "بنفش", "نوک مدادی", "قهوه ای", "زرد", "نارنجی", "سرمه ای",
    "black", "white", "blue", "red", "gold", "silver", "gray", "grey", "green",
    "purple", "rose gold",
    # warranty
    "گارانتی", "ضمانت", "اصالت", "18 ماهه", "12 ماهه", "24 ماهه", "ماهه",
    "وarranty", "warranty",
    # storage / ram variants
    "گیگابایت", "ترابایت", "مگابایت", "گیگ", "گیگا", "رم", "ram", "rom",
    "gb", "tb", "mb",
    # packaging / region fluff
    "اورجینال", "اصلی", "اورجینل", "پک", "پکیج", "گلوبال", "چین", "هند",
    "ویتنام", "شرکتی",
    # marketplace fluff
    "خرید", "فروش", "قیمت", "مشخصات", "بررسی", "ارزان", "تخفیف", "ویژه",
    "فروشگاه", "گوشی موبایل", "گوشی", "موبایل", "لپ تاپ", "لپتاپ",
    "mobile", "phone", "laptop",
)

# Terms that must NEVER be removed even if they appear in noise lists
PROTECTED_TERMS: Tuple[str, ...] = (
    "iphone", "ipad", "galaxy", "samsung", "apple", "xiaomi", "redmi",
    "poco", "huawei", "nokia", "asus", "rog", "zenfone", "sony", "pro",
    "max", "ultra", "plus", "note", "mini", "lite",
)


def _strip_noise(text: str, extra_noise: Iterable[str] = ()) -> str:
    noise = list(DEFAULT_NOISE_TERMS) + list(extra_noise)
    # longest-first to avoid partial overlaps
    for term in sorted({n.lower().strip() for n in noise if n.strip()}, key=len, reverse=True):
        if term in PROTECTED_TERMS:
            continue
        pattern = r"(?<![^\W_])" + re.escape(term) + r"(?![^\W_])"
        text = re.sub(pattern, " ", text, flags=re.IGNORECASE)
    # storage / capacity numbers (128, 256, 512, 1024 ...) are noise;
    # short model numbers (13, 12, 54) are preserved as identifiers.
    text = re.sub(r"(?<![\w.])\d{3,}(?![\w.])", " ", text)
    return text


def normalize_persian_text(text: Optional[str]) -> str:
    """Normalize Persian/Arabic/Latin mixed text into a comparable form.

    Preserves digit translation and ZWNJ collapse; folds Arabic letter
    variants, removes invisible characters, punctuation and collapses spaces.
    """
    if not text:
        return ""
    t = text.translate(ARABIC_CHAR_FIXES).translate(PERSIAN_TO_ENGLISH_DIGITS)
    t = _INVISIBLE_RE.sub(" ", t)
    # نیم‌فاصله (ZWNJ) and whitespace variants -> single space
    t = re.sub(r"[\u200c\r\n\t_]+", " ", t)
    # punctuation / symbols (keep word characters, digits, dash, dot, slash)
    t = re.sub(r"[^\w\s\-\./]", " ", t)
    # latin dash variants used as separators
    t = t.replace("–", " ").replace("—", " ")
    return re.sub(r"\s+", " ", t).strip().lower()


def build_canonical_signature(
    title: Optional[str],
    extra_noise: Iterable[str] = (),
) -> Optional[str]:
    """Build a stable, deterministic canonical product signature from a title.

    The signature removes configurable noise terms (colors, warranty,
    storage/RAM variants, marketplace fluff) while keeping model identifiers
    (e.g. ``iphone 13``, ``galaxy a54``).
    """
    if not title:
        return None
    normalized = normalize_persian_text(title)
    normalized = _strip_noise(normalized, extra_noise)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized if normalized else "unknown_signature"


# ---------------------------------------------------------------------------
# Tokenization & deterministic fuzzy similarity (stdlib only)
# ---------------------------------------------------------------------------

_TOKEN_RE = re.compile(r"[a-z0-9\u0600-\u06ff\u06f0-\u06f9]+")


def tokenize(text: Optional[str]) -> List[str]:
    """Deterministic, lowercase tokenization of the *canonical* form (noise
    terms such as colors/warranty/storage removed, model identifiers kept)."""
    if not text:
        return []
    canonical = build_canonical_signature(text)
    if not canonical or canonical == "unknown_signature":
        return []
    return _TOKEN_RE.findall(canonical)


def token_jaccard(a: Sequence[str], b: Sequence[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def char_similarity(a: str, b: str) -> float:
    """Conservative character similarity via difflib.SequenceMatcher."""
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def containment(a: Sequence[str], b: Sequence[str]) -> float:
    """Fraction of the smaller token set contained in the larger one."""
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / min(len(sa), len(sb))


def similar_titles(
    title_a: str,
    title_b: str,
    jaccard_threshold: float = 0.6,
    char_threshold: float = 0.82,
    containment_threshold: float = 0.85,
) -> bool:
    """Deterministically decide whether two titles refer to the same product.

    Rules (any one suffices):
    1. token Jaccard >= jaccard_threshold
    2. containment >= containment_threshold AND char_similarity >= 0.6
    3. char_similarity >= char_threshold on canonical signatures

    ``samsung a54`` / ``سامسونگ a54`` / ``سامسونگ-a54`` group together,
    while ``a54`` vs ``a55`` never group (different model identifier).
    """
    ta, tb = tokenize(title_a), tokenize(title_b)
    ta, tb = _fold_brand_tokens(ta), _fold_brand_tokens(tb)
    if not ta or not tb:
        return False
    if sorted(ta) == sorted(tb):
        return True
    jac = token_jaccard(ta, tb)
    if jac >= jaccard_threshold:
        # Guard: differing pure model-identifier tokens (e.g. a54 vs a55)
        if _model_tokens_differ(ta, tb):
            return False
        return True
    cont = containment(ta, tb)
    if cont >= containment_threshold:
        if _model_tokens_differ(ta, tb):
            return False
        return char_similarity(" ".join(ta), " ".join(tb)) >= 0.6
    sig_a, sig_b = build_canonical_signature(title_a) or "", build_canonical_signature(title_b) or ""
    return char_similarity(sig_a, sig_b) >= char_threshold and not _model_tokens_differ(ta, tb)


_MODEL_ID_RE = re.compile(r"^[a-z]*\d+[a-z]*$", re.IGNORECASE)

# Cross-language brand synonyms folded before similarity comparison so that
# Persian and Latin renderings of the same brand group together.
BRAND_SYNONYMS: Dict[str, str] = {
    "samsung": "سامسونگ", "applesamsung": "سامسونگ",
    "apple": "اپل", "ip": "اپل",
    "xiaomi": "شیائومی", "شیاومی": "شیائومی", "redmi": "redmi",
    "huawei": "هوآوی", "هواوی": "هوآوی",
    "nokia": "نوکیا", "asus": "ایسوس",
}

def _fold_brand_tokens(tokens: Sequence[str]) -> List[str]:
    return [BRAND_SYNONYMS.get(t, t) for t in tokens]


def _model_tokens_differ(ta: Sequence[str], tb: Sequence[str]) -> bool:
    """True when the two token lists contain model-like identifiers that differ
    (e.g. ``a54`` vs ``a55``, ``iphone13`` vs ``iphone14``)."""
    only_a = set(ta) - set(tb)
    only_b = set(tb) - set(ta)
    for x in only_a:
        if _MODEL_ID_RE.match(x) and any(
            _MODEL_ID_RE.match(y) and (x[0].isalpha() == y[0].isalpha())
            and abs(int(re.sub(r"\D", "", x) or 0) - int(re.sub(r"\D", "", y) or 0)) <= 20
            for y in only_b
        ):
            return True
    return False


class TitleGrouper:
    """Deterministic single-pass fuzzy grouping of product titles.

    Each title is compared against a canonical representative per group using
    :func:`similar_titles`; the first matching group wins, otherwise a new
    group is created. Group representatives are stored in insertion order, so
    results are reproducible across runs.
    """

    def __init__(
        self,
        jaccard_threshold: float = 0.6,
        char_threshold: float = 0.82,
        containment_threshold: float = 0.85,
    ) -> None:
        self.jaccard_threshold = jaccard_threshold
        self.char_threshold = char_threshold
        self.containment_threshold = containment_threshold
        self._representatives: List[str] = []
        self._groups: Dict[int, List[str]] = {}
        self._signature_to_group: Dict[str, int] = {}

    def add(self, title: str, extra_noise: Iterable[str] = ()) -> int:
        """Add a title and return its group index (stable for equal inputs)."""
        sig = build_canonical_signature(title, extra_noise) or ""
        if sig in self._signature_to_group:
            return self._signature_to_group[sig]
        for gid, rep in enumerate(self._representatives):
            if similar_titles(
                title, rep,
                self.jaccard_threshold,
                self.char_threshold,
                self.containment_threshold,
            ):
                self._groups[gid].append(title)
                self._signature_to_group[sig] = gid
                return gid
        gid = len(self._representatives)
        self._representatives.append(title)
        self._groups[gid] = [title]
        self._signature_to_group[sig] = gid
        return gid

    def add_many(self, titles: Iterable[str]) -> List[int]:
        return [self.add(t) for t in titles]

    def groups(self) -> Dict[int, List[str]]:
        return {gid: list(members) for gid, members in self._groups.items()}

    def group_count(self) -> int:
        return len(self._representatives)

    def representative(self, gid: int) -> Optional[str]:
        if 0 <= gid < len(self._representatives):
            return self._representatives[gid]
        return None


# ---------------------------------------------------------------------------
# Currency extraction (unchanged public behavior)
# ---------------------------------------------------------------------------

def extract_and_convert_currency(raw_text: str) -> Tuple[Optional[int], Optional[str], Optional[int], Optional[int]]:
    if not raw_text:
        return None, None, None, None

    normalized = normalize_persian_text(raw_text)
    match = RE_PRICE_EXTRACT.search(normalized)
    if not match:
        return None, None, None, None

    num_str = re.sub(r"[,\s\.\u066C]", "", match.group(1))
    try:
        raw_val = int(num_str)
    except ValueError:
        return None, None, None, None

    unit_indicator = (match.group(2) or "").lower()

    if "ریال" in unit_indicator or unit_indicator == "ر":
        unit = "IRR"
        price_irr = raw_val
        price_irt = int(raw_val // 10)
    elif "تومان" in unit_indicator or unit_indicator == "ت":
        unit = "IRT"
        price_irt = raw_val
        price_irr = int(raw_val * 10)
    else:
        if raw_val >= 10_000_000 and raw_val % 10 == 0:
            unit = "IRR"
            price_irr = raw_val
            price_irt = int(raw_val // 10)
        else:
            unit = "IRT"
            price_irt = raw_val
            price_irr = int(raw_val * 10)

    return raw_val, unit, price_irt, price_irr
