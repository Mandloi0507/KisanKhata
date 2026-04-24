"""Validators for common input fields."""

import re

AADHAAR_REGEX = re.compile(r"^\d{12}$")
MOBILE_REGEX = re.compile(r"^[6-9]\d{9}$")


def validate_aadhaar(aadhaar: str) -> bool:
    """Validate Aadhaar: exactly 12 digits."""
    return bool(AADHAAR_REGEX.match(aadhaar))


def validate_mobile(mobile: str) -> bool:
    """Validate Indian mobile: 10 digits, starts with 6-9."""
    return bool(MOBILE_REGEX.match(mobile))


def validate_land_area(acres: float) -> bool:
    """Validate land area: 0.1 to 1000 acres."""
    return 0.1 <= acres <= 1000


def sanitize_text(text: str) -> str:
    """Strip HTML tags and normalize whitespace."""
    import html
    clean = re.sub(r"<[^>]+>", "", text)
    clean = html.unescape(clean)
    return clean.strip()
