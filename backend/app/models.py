from pydantic import BaseModel, Field
from typing import List, Optional, Any


class StoreWeatherRequest(BaseModel):
    latitude: float = Field(..., description="Latitude between -90 and 90")
    longitude: float = Field(..., description="Longitude between -180 and 180")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")


class StoreWeatherResponse(BaseModel):
    status: str = "ok"
    file: str


class WeatherFileInfo(BaseModel):
    name: str
    size: int
    created_at: str


class ListWeatherFilesResponse(BaseModel):
    files: List[WeatherFileInfo]


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
