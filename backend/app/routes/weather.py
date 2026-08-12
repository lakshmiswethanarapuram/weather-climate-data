from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.models import (
    StoreWeatherRequest,
    StoreWeatherResponse,
    ListWeatherFilesResponse,
    ErrorResponse,
)
from app.services.validation import validate_weather_request
from app.services.open_meteo import OpenMeteoClient
from app.services.storage import StorageService, validate_filename_safety

router = APIRouter()


@router.post(
    "/store-weather-data",
    response_model=StoreWeatherResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal storage or API error"},
    },
)
async def store_weather_data(payload: StoreWeatherRequest):
    # 1. Validate inputs
    try:
        validate_weather_request(
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date_str=payload.start_date,
            end_date_str=payload.end_date,
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "message": str(err)},
        )

    # 2. Call Open-Meteo API
    open_meteo_client = OpenMeteoClient()
    try:
        raw_weather_json = await open_meteo_client.fetch_historical_weather(
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"status": "error", "message": f"Failed to fetch weather data: {str(err)}"},
        )

    # 3. Store in Cloud Storage / Local Storage fallback
    storage_service = StorageService()
    try:
        filename = storage_service.generate_filename(
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date=payload.start_date,
            end_date=payload.end_date,
        )
        stored_file = storage_service.store_json(filename, raw_weather_json)
        return StoreWeatherResponse(status="ok", file=stored_file)
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"status": "error", "message": f"Storage error: {str(err)}"},
        )


@router.get(
    "/list-weather-files",
    response_model=ListWeatherFilesResponse,
    responses={
        500: {"model": ErrorResponse, "description": "Storage listing error"},
    },
)
async def list_weather_files():
    storage_service = StorageService()
    try:
        files = storage_service.list_files()
        return ListWeatherFilesResponse(files=files)
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"status": "error", "message": f"Failed to list weather files: {str(err)}"},
        )


@router.get(
    "/weather-file-content/{file}",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid filename format"},
        404: {"model": ErrorResponse, "description": "File not found"},
        500: {"model": ErrorResponse, "description": "Storage retrieval error"},
    },
)
async def get_weather_file_content(file: str):
    if not validate_filename_safety(file):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "message": "Invalid file name or unsafe path format"},
        )

    storage_service = StorageService()
    try:
        content = storage_service.get_file_content(file)
        if content is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"status": "error", "message": "not found"},
            )
        return content
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"status": "error", "message": f"Failed to read file content: {str(err)}"},
        )
