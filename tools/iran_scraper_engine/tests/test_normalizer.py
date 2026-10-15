from iran_scraper.parser.normalizer import (
    build_canonical_signature,
    extract_and_convert_currency,
    normalize_persian_text,
    similar_titles,
    token_jaccard,
    tokenize,
    TitleGrouper,
)


def test_canonical_signature_cleans_noise():
    raw = "گوشی موبایل اپل مدل iPhone 13 ظرفیت ۱۲۸ گیگابایت رم ۴ رنگ آبی گارانتی ۱۸ ماهه شرکتی"
    sig = build_canonical_signature(raw)
    assert "iphone 13" in sig
    assert "گارانتی" not in sig
    assert "۱۲۸" not in sig
    assert "آبی" not in sig


def test_currency_extraction_irt():
    raw = "قیمت: ۴۵,۰۰۰,۰۰۰ تومان"
    raw_p, unit, irt, irr = extract_and_convert_currency(raw)
    assert raw_p == 45000000
    assert unit == "IRT"
    assert irt == 45000000
    assert irr == 450000000


def test_currency_extraction_irr():
    raw = "۴۵۰,۰۰۰,۰۰۰ ریال"
    raw_p, unit, irt, irr = extract_and_convert_currency(raw)
    assert unit == "IRR"
    assert irt == 45000000
    assert irr == 450000000


def test_unicode_variant_folding():
    a = normalize_persian_text("سامسونگ A54")
    b = normalize_persian_text("سامسونگ\u200cA54")   # ZWNJ
    c = normalize_persian_text("سامسونگ - A54")      # dash separator
    assert tokenize(a) == tokenize(b) == ["سامسونگ", "a54"]
    assert similar_titles(a, c)
    assert normalize_persian_text("ي و ك") == "ی و ک"


def test_similar_titles_group():
    assert similar_titles("سامسونگ A54", "Samsung A54")
    assert similar_titles("سامسونگ A54", "سامسونگ-A54")


def test_different_models_do_not_group():
    assert not similar_titles("سامسونگ A54", "سامسونگ A55")
    assert not similar_titles("iphone 13", "iphone 14")
    assert not similar_titles("سامسونگ A54", "شیائومی Redmi Note 12")


def test_title_grouper_deterministic():
    titles = [
        "سامسونگ Galaxy A54 5G رنگ آبی",
        "Samsung A54 5G",
        "سامسونگ-A54",
        "سامسونگ Galaxy A55 5G",
        "گوشی سامسونگ A55",
    ]
    g1 = TitleGrouper()
    labels1 = g1.add_many(titles)
    g2 = TitleGrouper()
    labels2 = g2.add_many(titles)
    assert labels1 == labels2
    assert labels1[0] == labels1[1] == labels1[2]
    assert labels1[3] == labels1[4]
    assert labels1[0] != labels1[3]
    assert g1.group_count() == 2


def test_noise_removal_keeps_model_identifier():
    sig = build_canonical_signature("گوشی موبایل سامسونگ مدل Galaxy A54 رنگ مشکی ظرفیت 256 گیگابایت")
    assert "a54" in sig
    assert "مشکی" not in sig
    assert "256" not in sig


def test_token_jaccard():
    assert token_jaccard(["a", "b"], ["a", "b"]) == 1.0
    assert token_jaccard(["a"], ["b"]) == 0.0
