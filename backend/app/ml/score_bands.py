"""
Score band configuration — maps KisanScore ranges to loan recommendations.
Config-driven, per-bank overrides via JSON in banks table.
"""

import json

# Default score band matrix (from Backend_Structure §10)
DEFAULT_SCORE_BANDS = {
    "Poor": {"min": 0, "max": 400, "loan_min": 0, "loan_max": 25000, "rate": 14.0},
    "Fair": {"min": 401, "max": 600, "loan_min": 25001, "loan_max": 75000, "rate": 12.0},
    "Good": {"min": 601, "max": 750, "loan_min": 75001, "loan_max": 150000, "rate": 9.0},
    "Excellent": {"min": 751, "max": 1000, "loan_min": 150001, "loan_max": 200000, "rate": 7.0},
}


def get_score_category(score: int) -> str:
    """Map score to category: Poor, Fair, Good, Excellent."""
    if score >= 751:
        return "Excellent"
    elif score >= 601:
        return "Good"
    elif score >= 401:
        return "Fair"
    else:
        return "Poor"


def get_loan_recommendation(score: int, bank_config_json: str | None = None) -> dict:
    """
    Get loan recommendation for a given score.
    Uses bank-specific config if available, otherwise falls back to defaults.
    """
    # Use bank-specific config if available
    bands = DEFAULT_SCORE_BANDS
    if bank_config_json:
        try:
            bands = json.loads(bank_config_json)
        except (json.JSONDecodeError, TypeError):
            pass

    category = get_score_category(score)
    band = bands.get(category, DEFAULT_SCORE_BANDS["Poor"])

    return {
        "score_band": category,
        "amount_min_inr": band["loan_min"],
        "amount_max_inr": band["loan_max"],
        "rate_percent": band["rate"],
    }
