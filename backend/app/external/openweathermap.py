"""
OpenWeatherMap API client — fetches current weather and rainfall data.
Also provides drought detection for distress engine.
"""

import httpx
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.utils.cache import cache

logger = logging.getLogger("kisankhata.openweather")

OWM_BASE_URL = "https://api.openweathermap.org/data/2.5"


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
)
async def _fetch_weather(lat: float, lng: float) -> dict | None:
    """Fetch current weather from OpenWeatherMap."""
    if not settings.OPENWEATHER_API_KEY:
        return None

    url = f"{OWM_BASE_URL}/weather"
    params = {
        "lat": lat,
        "lon": lng,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def get_current_weather(district: str, lat: float, lng: float) -> dict:
    """
    Get current weather data for a district location.
    Returns temperature, humidity, rainfall, weather description.
    Cached for 1 hour.
    """
    cache_key = f"owm:{lat:.2f}:{lng:.2f}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        data = await _fetch_weather(lat, lng)
        if data:
            rain_1h = data.get("rain", {}).get("1h", 0)
            rain_3h = data.get("rain", {}).get("3h", 0)
            weather_main = data.get("weather", [{}])[0].get("main", "Clear")
            weather_desc = data.get("weather", [{}])[0].get("description", "clear sky")

            result = {
                "temperature_c": data.get("main", {}).get("temp", 0),
                "humidity_pct": data.get("main", {}).get("humidity", 0),
                "rain_1h_mm": rain_1h,
                "rain_3h_mm": rain_3h,
                "weather_main": weather_main,
                "weather_description": weather_desc,
                "wind_speed_mps": data.get("wind", {}).get("speed", 0),
                "source": "OpenWeatherMap",
                "is_fallback": False,
            }
            cache.set(cache_key, result, ttl_seconds=3600)  # 1 hour
            return result
    except Exception as e:
        logger.warning(f"OpenWeatherMap API failed for {district}: {e}")

    # Fallback — return default mild weather
    result = {
        "temperature_c": 28.0,
        "humidity_pct": 65,
        "rain_1h_mm": 0,
        "rain_3h_mm": 0,
        "weather_main": "Clear",
        "weather_description": "data unavailable",
        "wind_speed_mps": 3.0,
        "source": "Fallback Default",
        "is_fallback": True,
    }
    cache.set(cache_key, result, ttl_seconds=3600)
    return result


async def is_drought_active(district: str, lat: float, lng: float) -> bool:
    """
    Check if drought conditions are present.
    Uses a combination of current weather and heuristic rules.
    """
    weather = await get_current_weather(district, lat, lng)

    # Drought indicators:
    # 1. Very low humidity (<30%)
    # 2. High temperature (>38°C)
    # 3. No recent rainfall
    # 4. Weather classified as "Drizzle" or extreme conditions
    drought_score = 0
    if weather["humidity_pct"] < 30:
        drought_score += 1
    if weather["temperature_c"] > 38:
        drought_score += 1
    if weather["rain_1h_mm"] == 0 and weather["rain_3h_mm"] == 0:
        drought_score += 1

    # Drought if 2+ indicators present
    return drought_score >= 2
