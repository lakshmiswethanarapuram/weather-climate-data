import httpx
from typing import Dict, Any
from app.config import settings


class OpenMeteoClient:
    def __init__(self, base_url: str = None, timeout: float = 10.0):
        self.base_url = base_url or settings.open_meteo_base_url
        self.timeout = timeout

    async def fetch_historical_weather(
        self, latitude: float, longitude: float, start_date: str, end_date: str
    ) -> Dict[str, Any]:
        """
        Fetches historical weather data from Open-Meteo Archive API.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min",
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as exc:
                raise RuntimeError(f"Open-Meteo API returned error status {exc.response.status_code}: {exc.response.text}")
            except httpx.RequestError as exc:
                raise RuntimeError(f"Failed to communicate with Open-Meteo API: {str(exc)}")
