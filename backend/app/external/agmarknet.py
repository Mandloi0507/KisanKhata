"""
AGMARKNET / data.gov.in API client — fetches mandi (market) crop prices.
"""

import httpx
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.utils.cache import cache

logger = logging.getLogger("kisankhata.agmarknet")

# Fallback mandi prices (₹ per quintal) — April 2026 estimated data
FALLBACK_MANDI_PRICES = {
    "Wheat": {"price_per_quintal": 2275, "yield_per_acre_quintal": 22},
    "Rice": {"price_per_quintal": 2150, "yield_per_acre_quintal": 25},
    "Soybean": {"price_per_quintal": 4200, "yield_per_acre_quintal": 10},
    "Cotton": {"price_per_quintal": 6500, "yield_per_acre_quintal": 8},
    "Sugarcane": {"price_per_quintal": 315, "yield_per_acre_quintal": 350},
    "Maize": {"price_per_quintal": 2090, "yield_per_acre_quintal": 30},
    "Pulses": {"price_per_quintal": 5500, "yield_per_acre_quintal": 8},
    "Mustard": {"price_per_quintal": 5050, "yield_per_acre_quintal": 7},
    "Onion": {"price_per_quintal": 1800, "yield_per_acre_quintal": 120},
    "Chilli": {"price_per_quintal": 12000, "yield_per_acre_quintal": 12},
    "Grapes": {"price_per_quintal": 4500, "yield_per_acre_quintal": 80},
    "Coconut": {"price_per_quintal": 2800, "yield_per_acre_quintal": 50},
}


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
)
async def _fetch_mandi_price(crop: str, state: str) -> dict | None:
    """Fetch mandi price from data.gov.in AGMARKNET API."""
    if not settings.AGMARKNET_API_KEY:
        return None

    url = settings.AGMARKNET_API_URL
    params = {
        "api-key": settings.AGMARKNET_API_KEY,
        "format": "json",
        "filters[commodity]": crop,
        "filters[state]": state,
        "limit": 5,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data


async def get_mandi_price(crop: str, district: str, state: str) -> dict:
    """
    Get mandi price for a crop in a district.
    Cached for 24 hours. Falls back to static price table.
    """
    cache_key = f"mandi:{crop}:{district}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        data = await _fetch_mandi_price(crop, state)
        if data and "records" in data and len(data["records"]) > 0:
            records = data["records"]
            # Average modal price across recent records
            prices = [float(r.get("modal_price", 0)) for r in records if r.get("modal_price")]
            if prices:
                avg_price = sum(prices) / len(prices)
                fallback_data = FALLBACK_MANDI_PRICES.get(crop, {"yield_per_acre_quintal": 15})
                result = {
                    "price_per_quintal": round(avg_price, 2),
                    "yield_per_acre_quintal": fallback_data["yield_per_acre_quintal"],
                    "source": "AGMARKNET (data.gov.in)",
                    "is_fallback": False,
                    "records_count": len(prices),
                }
                cache.set(cache_key, result, ttl_seconds=86400)
                return result
    except Exception as e:
        logger.warning(f"AGMARKNET API failed for {crop} in {district}: {e}")

    # Fallback to static prices
    fallback = FALLBACK_MANDI_PRICES.get(crop, {"price_per_quintal": 2000, "yield_per_acre_quintal": 15})
    result = {
        "price_per_quintal": fallback["price_per_quintal"],
        "yield_per_acre_quintal": fallback["yield_per_acre_quintal"],
        "source": "Static Price Table (April 2026)",
        "is_fallback": True,
        "records_count": 0,
    }
    cache.set(cache_key, result, ttl_seconds=86400)
    return result
