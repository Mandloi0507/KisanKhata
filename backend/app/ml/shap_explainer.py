"""
SHAP explainer — extracts feature importance for KisanScore predictions.
Uses TreeExplainer for both XGBoost and RandomForest models.
"""

import numpy as np
import shap
import logging
from app.ml.model import _xgb_model, _rf_model, _models_loaded
from app.ml.features import FEATURE_NAMES

logger = logging.getLogger("kisankhata.ml.shap")

# Human-readable labels for each feature
FEATURE_LABELS = {
    "land_area_acres": {"en": "Land Area", "hi": "ज़मीन का क्षेत्रफल"},
    "crop_profitability": {"en": "Crop Type & Profitability", "hi": "फसल का प्रकार और लाभप्रदता"},
    "ndvi_value": {"en": "Crop Health (NDVI)", "hi": "फसल स्वास्थ्य"},
    "rainfall_deviation_pct": {"en": "Rainfall Risk", "hi": "वर्षा जोखिम"},
    "estimated_revenue_log": {"en": "Income Potential (Mandi)", "hi": "आय क्षमता (मंडी)"},
    "pm_kisan_enrolled": {"en": "PM-KISAN Enrollment", "hi": "पीएम-किसान नामांकन"},
    "pmfby_enrolled": {"en": "Crop Insurance (PMFBY)", "hi": "फसल बीमा (पीएमएफबीवाई)"},
    "district_avg_score_norm": {"en": "Regional Average", "hi": "क्षेत्रीय औसत"},
}


def compute_shap_values(features: np.ndarray) -> list[dict]:
    """
    Compute SHAP values for a single prediction.
    Returns list of factors sorted by absolute contribution.
    """
    if not _models_loaded or _xgb_model is None:
        return _fallback_explanation(features)

    try:
        X = features.reshape(1, -1)

        # Use TreeExplainer on the primary (XGBoost) model
        explainer = shap.TreeExplainer(_xgb_model)
        shap_values = explainer.shap_values(X)

        if isinstance(shap_values, list):
            shap_values = shap_values[0]

        shap_array = shap_values.flatten()

        # Build factors list
        factors = []
        for i, feature_name in enumerate(FEATURE_NAMES):
            shap_val = float(shap_array[i]) if i < len(shap_array) else 0.0
            labels = FEATURE_LABELS.get(feature_name, {"en": feature_name, "hi": feature_name})

            # Scale SHAP values to contribution points (roughly -100 to +100)
            contribution = int(np.clip(shap_val * 0.5, -100, 100))

            factors.append({
                "feature_name": feature_name,
                "label": labels["en"],
                "label_hi": labels["hi"],
                "contribution": contribution,
                "direction": "positive" if contribution >= 0 else "negative",
                "shap_value": round(shap_val, 4),
                "feature_value": round(float(features[i]), 4),
            })

        # Sort by absolute contribution (most impactful first)
        factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)

        # Return top 6 factors
        return factors[:6]

    except Exception as e:
        logger.warning(f"SHAP computation failed: {e}")
        return _fallback_explanation(features)


def _fallback_explanation(features: np.ndarray) -> list[dict]:
    """Generate explanation without SHAP when models aren't loaded."""
    weights = [120, 80, 200, 180, 200, 60, 80, 80]
    factors = []

    for i, feature_name in enumerate(FEATURE_NAMES):
        labels = FEATURE_LABELS.get(feature_name, {"en": feature_name, "hi": feature_name})
        val = float(features[i]) if i < len(features) else 0.5
        contribution = int((val - 0.5) * weights[i] * 0.3)

        factors.append({
            "feature_name": feature_name,
            "label": labels["en"],
            "label_hi": labels["hi"],
            "contribution": contribution,
            "direction": "positive" if contribution >= 0 else "negative",
            "shap_value": 0.0,
            "feature_value": round(val, 4),
        })

    factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return factors[:6]


def generate_xai_summary(factors: list[dict], farmer_name: str, crop: str, district: str) -> dict:
    """
    Generate human-readable explanation from SHAP factors.
    Uses template-based generation (no paid API needed).
    Returns dict with en and hi summaries.
    """
    positives = [f for f in factors if f["direction"] == "positive"]
    negatives = [f for f in factors if f["direction"] == "negative"]

    # English summary
    en_parts = []
    if positives:
        top_pos = positives[0]["label"]
        en_parts.append(f"{farmer_name}'s {crop} profile shows strong performance in {top_pos.lower()}")
    if len(positives) > 1:
        en_parts.append(f"with additional support from {positives[1]['label'].lower()}")
    if negatives:
        top_neg = negatives[0]["label"]
        en_parts.append(f"However, {top_neg.lower()} is a concern that slightly lowers the score")

    summary_en = ". ".join(en_parts) + "." if en_parts else f"{farmer_name} has a moderate credit profile."

    # Hindi summary
    hi_parts = []
    if positives:
        top_pos_hi = positives[0]["label_hi"]
        hi_parts.append(f"{farmer_name} की {crop} प्रोफ़ाइल {top_pos_hi} में मजबूत है")
    if negatives:
        top_neg_hi = negatives[0]["label_hi"]
        hi_parts.append(f"लेकिन {top_neg_hi} एक चिंता का विषय है")

    summary_hi = "। ".join(hi_parts) + "।" if hi_parts else f"{farmer_name} की क्रेडिट प्रोफ़ाइल सामान्य है।"

    return {"en": summary_en, "hi": summary_hi}
