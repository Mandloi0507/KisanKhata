"""
ML model inference — loads trained models and predicts KisanScore.
Ensemble: Final Score = 0.7 × XGBoost + 0.3 × RandomForest
"""

import os
import numpy as np
import joblib
import logging

from app.ml.features import FEATURE_NAMES
from app.ml.score_bands import get_score_category

logger = logging.getLogger("kisankhata.ml.model")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

# Global model references
_xgb_model = None
_rf_model = None
_models_loaded = False


def load_models():
    """Load trained models from disk. Called on app startup."""
    global _xgb_model, _rf_model, _models_loaded

    xgb_path = os.path.join(MODEL_DIR, "xgboost_model.joblib")
    rf_path = os.path.join(MODEL_DIR, "rf_model.joblib")

    if not os.path.exists(xgb_path) or not os.path.exists(rf_path):
        logger.warning("Model files not found. Run 'python -m app.ml.train_model' first.")
        _models_loaded = False
        return

    _xgb_model = joblib.load(xgb_path)
    _rf_model = joblib.load(rf_path)
    _models_loaded = True
    logger.info("ML models loaded successfully")


def predict_score(features: np.ndarray) -> dict:
    """
    Predict KisanScore from a feature vector.
    Returns dict with score, category, and individual model predictions.
    """
    if not _models_loaded or _xgb_model is None or _rf_model is None:
        # Fallback — heuristic scoring if models not trained
        logger.warning("Models not loaded, using heuristic scoring")
        return _heuristic_score(features)

    # Reshape for single prediction
    X = features.reshape(1, -1)

    # Get predictions from both models
    xgb_pred = float(_xgb_model.predict(X)[0])
    rf_pred = float(_rf_model.predict(X)[0])

    # Ensemble: 0.7 * XGBoost + 0.3 * RandomForest
    ensemble_score = 0.7 * xgb_pred + 0.3 * rf_pred

    # Clip to valid range
    final_score = int(np.clip(round(ensemble_score), 0, 1000))
    category = get_score_category(final_score)

    return {
        "score": final_score,
        "category": category,
        "xgb_prediction": round(xgb_pred, 1),
        "rf_prediction": round(rf_pred, 1),
        "model_type": "ensemble",
    }


def _heuristic_score(features: np.ndarray) -> dict:
    """Fallback heuristic scoring when ML models are not available."""
    # Weighted sum similar to training formula
    score = (
        features[0] * 120 +   # land
        features[1] * 80 +    # crop profitability
        features[2] * 200 +   # ndvi
        (1 - abs(features[3])) * 180 +  # rainfall
        features[4] * 200 +   # revenue
        features[5] * 60 +    # pm kisan
        features[6] * 80 +    # pmfby
        features[7] * 80      # district avg
    )
    final_score = int(np.clip(round(score), 0, 1000))
    return {
        "score": final_score,
        "category": get_score_category(final_score),
        "xgb_prediction": final_score,
        "rf_prediction": final_score,
        "model_type": "heuristic_fallback",
    }


def are_models_loaded() -> bool:
    """Check if ML models are loaded."""
    return _models_loaded
