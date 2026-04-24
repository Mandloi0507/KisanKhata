"""
Feature engineering for KisanScore ML model.
Converts raw farmer + API data into model-ready features.
"""

import numpy as np

# Crop profitability ranking (ordinal encoding)
CROP_ENCODING = {
    "Wheat": 7, "Rice": 7, "Soybean": 6, "Cotton": 5,
    "Sugarcane": 8, "Maize": 6, "Pulses": 5, "Mustard": 6,
    "Onion": 7, "Chilli": 8, "Grapes": 9, "Coconut": 7,
}

FEATURE_NAMES = [
    "land_area_acres",
    "crop_profitability",
    "ndvi_value",
    "rainfall_deviation_pct",
    "estimated_revenue_log",
    "pm_kisan_enrolled",
    "pmfby_enrolled",
    "district_avg_score_norm",
]


def engineer_features(
    land_area_acres: float,
    primary_crop: str,
    ndvi_value: float,
    rainfall_annual_mm: float,
    district_avg_rainfall_mm: float,
    estimated_revenue_inr: float,
    pm_kisan_enrolled: bool,
    pmfby_enrolled: bool,
    district_avg_score: float = 600.0,
) -> np.ndarray:
    """
    Convert raw inputs to a feature vector for the ML model.
    Returns a 1D numpy array of 8 features.
    """
    # 1. Land area (normalize: 0.1-20 acres → 0-1)
    land_norm = min(max(land_area_acres / 20.0, 0.0), 1.0)

    # 2. Crop profitability (ordinal: 1-10)
    crop_prof = CROP_ENCODING.get(primary_crop, 5) / 10.0

    # 3. NDVI value (already 0-1)
    ndvi = min(max(ndvi_value, 0.0), 1.0)

    # 4. Rainfall deviation from district average (%)
    if district_avg_rainfall_mm > 0:
        rain_dev = (rainfall_annual_mm - district_avg_rainfall_mm) / district_avg_rainfall_mm
    else:
        rain_dev = 0.0
    # Clip to [-1, 1]
    rain_dev = min(max(rain_dev, -1.0), 1.0)

    # 5. Estimated revenue (log scale, normalized)
    revenue_log = np.log1p(max(estimated_revenue_inr, 0)) / 15.0  # log(~3M) ≈ 15

    # 6. PM-KISAN enrollment (binary)
    pm_kisan = 1.0 if pm_kisan_enrolled else 0.0

    # 7. PMFBY enrollment (binary)
    pmfby = 1.0 if pmfby_enrolled else 0.0

    # 8. District average score (normalized 0-1)
    dist_score_norm = min(max(district_avg_score / 1000.0, 0.0), 1.0)

    return np.array([
        land_norm,
        crop_prof,
        ndvi,
        rain_dev,
        revenue_log,
        pm_kisan,
        pmfby,
        dist_score_norm,
    ], dtype=np.float64)
