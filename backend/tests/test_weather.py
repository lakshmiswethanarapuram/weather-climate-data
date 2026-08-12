import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from app.main import app

client = TestClient(app)

MOCK_OPEN_METEO_RESPONSE = {
    "latitude": 17.385,
    "longitude": 78.4867,
    "generationtime_ms": 0.15,
    "utc_offset_seconds": 0,
    "timezone": "GMT",
    "timezone_abbreviation": "GMT",
    "elevation": 500.0,
    "daily_units": {
        "time": "iso8601",
        "temperature_2m_max": "°C",
        "temperature_2m_min": "°C",
        "apparent_temperature_max": "°C",
        "apparent_temperature_min": "°C"
    },
    "daily": {
        "time": ["2026-08-01", "2026-08-02"],
        "temperature_2m_max": [30.5, 31.2],
        "temperature_2m_min": [22.1, 23.0],
        "apparent_temperature_max": [34.0, 35.1],
        "apparent_temperature_min": [24.5, 25.2]
    }
}


def test_store_weather_data_success(mocker):
    # Mock OpenMeteoClient
    mocker.patch(
        "app.services.open_meteo.OpenMeteoClient.fetch_historical_weather",
        new_callable=AsyncMock,
        return_value=MOCK_OPEN_METEO_RESPONSE,
    )

    # Mock StorageService
    mocker.patch(
        "app.services.storage.StorageService.generate_filename",
        return_value="weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json",
    )
    mocker.patch(
        "app.services.storage.StorageService.store_json",
        return_value="weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json",
    )

    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 17.3850,
            "longitude": 78.4867,
            "start_date": "2026-08-01",
            "end_date": "2026-08-02",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["file"] == "weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json"


def test_store_weather_data_invalid_latitude():
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 95.0,
            "longitude": 78.4867,
            "start_date": "2026-08-01",
            "end_date": "2026-08-02",
        },
    )

    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert "Latitude must be between -90 and 90" in data["message"]


def test_store_weather_data_open_meteo_failure(mocker):
    mocker.patch(
        "app.services.open_meteo.OpenMeteoClient.fetch_historical_weather",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Open-Meteo connection timeout"),
    )

    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 17.3850,
            "longitude": 78.4867,
            "start_date": "2026-08-01",
            "end_date": "2026-08-02",
        },
    )

    assert response.status_code == 502
    data = response.json()
    assert data["status"] == "error"
    assert "Failed to fetch weather data" in data["message"]


def test_store_weather_data_storage_failure(mocker):
    mocker.patch(
        "app.services.open_meteo.OpenMeteoClient.fetch_historical_weather",
        new_callable=AsyncMock,
        return_value=MOCK_OPEN_METEO_RESPONSE,
    )
    mocker.patch(
        "app.services.storage.StorageService.store_json",
        side_effect=RuntimeError("GCS permission denied"),
    )

    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 17.3850,
            "longitude": 78.4867,
            "start_date": "2026-08-01",
            "end_date": "2026-08-02",
        },
    )

    assert response.status_code == 500
    data = response.json()
    assert data["status"] == "error"
    assert "Storage error" in data["message"]


def test_list_weather_files_success(mocker):
    mock_files = [
        {
            "name": "weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json",
            "size": 1024,
            "created_at": "2026-08-12T18:30:00Z",
        }
    ]
    mocker.patch("app.services.storage.StorageService.list_files", return_value=mock_files)

    response = client.get("/list-weather-files")

    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert len(data["files"]) == 1
    assert data["files"][0]["name"] == "weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json"


def test_list_weather_files_storage_failure(mocker):
    mocker.patch(
        "app.services.storage.StorageService.list_files",
        side_effect=RuntimeError("Bucket access forbidden"),
    )

    response = client.get("/list-weather-files")

    assert response.status_code == 500
    data = response.json()
    assert data["status"] == "error"
    assert "Failed to list weather files" in data["message"]


def test_get_weather_file_content_success(mocker):
    filename = "weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json"
    mocker.patch(
        "app.services.storage.StorageService.get_file_content",
        return_value=MOCK_OPEN_METEO_RESPONSE,
    )

    response = client.get(f"/weather-file-content/{filename}")

    assert response.status_code == 200
    data = response.json()
    assert data["latitude"] == 17.385
    assert "daily" in data


def test_get_weather_file_content_not_found(mocker):
    filename = "weather_17.3850_78.4867_2026-08-01_2026-08-02_20260812183000.json"
    mocker.patch("app.services.storage.StorageService.get_file_content", return_value=None)

    response = client.get(f"/weather-file-content/{filename}")

    assert response.status_code == 404
    data = response.json()
    assert data["status"] == "error"
    assert data["message"] == "not found"


def test_get_weather_file_content_invalid_filename():
    # Attempt path traversal or non-matching filename format
    response = client.get("/weather-file-content/../secret.json")
    assert response.status_code in (400, 404)

    response2 = client.get("/weather-file-content/some_random_file.txt")
    assert response2.status_code == 400
    data2 = response2.json()
    assert data2["status"] == "error"
    assert "Invalid file name" in data2["message"]
