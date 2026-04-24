"""
NASA POWER API client — fetches historical seasonal rainfall and solar radiation.
Used for NDVI proxy and weather risk scoring.
"""

import httpx
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.utils.cache import cache

logger = logging.getLogger("kisankhata.nasa_power")

# Fallback district averages for when API is unavailable
DISTRICT_RAINFALL_AVERAGES = {
    "Vidisha": {"annual_mm": 1090, "kharif_mm": 820, "rabi_mm": 120},
    "Bhopal": {"annual_mm": 1160, "kharif_mm": 870, "rabi_mm": 140},
    "Nashik": {"annual_mm": 1050, "kharif_mm": 780, "rabi_mm": 130},
    "Ludhiana": {"annual_mm": 780, "kharif_mm": 610, "rabi_mm": 70},
    "Anand": {"annual_mm": 850, "kharif_mm": 700, "rabi_mm": 50},
    "Guntur": {"annual_mm": 920, "kharif_mm": 680, "rabi_mm": 130},
    "Meerut": {"annual_mm": 890, "kharif_mm": 720, "rabi_mm": 80},
    "Bhilwara": {"annual_mm": 640, "kharif_mm": 530, "rabi_mm": 40},
    "Burdwan": {"annual_mm": 1450, "kharif_mm": 1100, "rabi_mm": 120},
    "Aurangabad": {"annual_mm": 730, "kharif_mm": 600, "rabi_mm": 50},
    "Palakkad": {"annual_mm": 2200, "kharif_mm": 1600, "rabi_mm": 300},
    "Osmanabad": {"annual_mm": 680, "kharif_mm": 550, "rabi_mm": 40},
}

# NDVI proxy — solar radiation-based estimation when satellite data unavailable
DISTRICT_NDVI_AVERAGES = {
    "Vidisha": 0.62, "Bhopal": 0.58, "Nashik": 0.55, "Ludhiana": 0.64,
    "Anand": 0.52, "Guntur": 0.48, "Meerut": 0.60, "Bhilwara": 0.42,
    "Burdwan": 0.68, "Aurangabad": 0.45, "Palakkad": 0.72, "Osmanabad": 0.40,
}


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
)
async def _fetch_nasa_data(lat: float, lng: float, params: list[str]) -> dict | None:
    """Fetch data from NASA POWER API with retry."""
    url = settings.NASA_POWER_BASE_URL
    query_params = {
        "parameters": ",".join(params),
        "community": "AG",
        "longitude": lng,
        "latitude": lat,
        "format": "JSON",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, params=query_params)
        response.raise_for_status()
        return response.json()


async def get_rainfall_data(district: str, lat: float, lng: float, season: str = "annual") -> dict:
    """
    Fetch rainfall data for a district. Returns dict with rainfall_mm and source.
    Uses cache with 24h TTL, falls back to district averages.
    """
    cache_key = f"nasa:{district}:{season}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        data = await _fetch_nasa_data(lat, lng, ["PRECTOTCORR"])
        if data and "properties" in data and "parameter" in data["properties"]:
            precip = data["properties"]["parameter"].get("PRECTOTCORR", {})
            # Calculate annual average from monthly values
            monthly_values = [v for k, v in precip.items() if k != "ANN" and v > 0]
            annual_mm = sum(monthly_values) if monthly_values else 0
            ann_value = precip.get("ANN", annual_mm / 12 if annual_mm else 0)

            result = {
                "annual_mm": round(ann_value * 365, 1) if ann_value < 50 else round(ann_value, 1),
                "monthly_avg_mm": round(ann_value, 2),
                "source": "NASA POWER API",
                "is_fallback": False,
            }
            cache.set(cache_key, result, ttl_seconds=86400)  # 24h
            return result
    except Exception as e:
        logger.warning(f"NASA POWER API failed for {district}: {e}")

    # Fallback to district averages
    averages = DISTRICT_RAINFALL_AVERAGES.get(district, {"annual_mm": 900, "kharif_mm": 680, "rabi_mm": 100})
    result = {
        "annual_mm": averages["annual_mm"],
        "monthly_avg_mm": round(averages["annual_mm"] / 12, 2),
        "source": "District Historical Average",
        "is_fallback": True,
    }
    cache.set(cache_key, result, ttl_seconds=86400)
    return result


async def get_ndvi_proxy(district: str, lat: float, lng: float) -> dict:
    """
    Get NDVI proxy from NASA POWER solar radiation data.
    Uses ALLSKY_SFC_SW_DWN (solar radiation) as a proxy for vegetation activity.
    """
    cache_key = f"ndvi:{district}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        data = await _fetch_nasa_data(lat, lng, ["ALLSKY_SFC_SW_DWN"])
        if data and "properties" in data and "parameter" in data["properties"]:
            solar = data["properties"]["parameter"].get("ALLSKY_SFC_SW_DWN", {})
            ann_solar = solar.get("ANN", 0)
            # Convert solar radiation to NDVI proxy (normalized 0-1)
            # Higher solar + adequate rain → higher NDVI
            base_ndvi = DISTRICT_NDVI_AVERAGES.get(district, 0.50)
            # Adjust based on solar radiation (typical range 3-7 kWh/m²/day)
            solar_factor = min(max((ann_solar - 3) / 4, 0), 1) * 0.2
            ndvi_value = min(max(base_ndvi + solar_factor - 0.1 + 0.05, 0.1), 0.95)

            result = {
                "ndvi_value": round(ndvi_value, 3),
                "solar_radiation": round(ann_solar, 2),
                "source": "NASA POWER API (solar proxy)",
                "is_fallback": False,
            }
            cache.set(cache_key, result, ttl_seconds=86400)
            return result
    except Exception as e:
        logger.warning(f"NASA POWER NDVI proxy failed for {district}: {e}")

    # Fallback
    result = {
        "ndvi_value": DISTRICT_NDVI_AVERAGES.get(district, 0.50),
        "solar_radiation": 0,
        "source": "District Historical Average",
        "is_fallback": True,
    }
    cache.set(cache_key, result, ttl_seconds=86400)
    return result
