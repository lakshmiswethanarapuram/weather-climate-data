import pytest
from app.services.validation import validate_weather_request


def test_valid_weather_request():
    # Exactly 31 days (2026-08-01 to 2026-08-31)
    validate_weather_request(17.3850, 78.4867, "2026-08-01", "2026-08-31")


def test_latitude_below_min_rejected():
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        validate_weather_request(-91.0, 78.4867, "2026-08-01", "2026-08-07")


def test_latitude_above_max_rejected():
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        validate_weather_request(91.0, 78.4867, "2026-08-01", "2026-08-07")


def test_longitude_below_min_rejected():
    with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
        validate_weather_request(17.3850, -181.0, "2026-08-01", "2026-08-07")


def test_longitude_above_max_rejected():
    with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
        validate_weather_request(17.3850, 181.0, "2026-08-01", "2026-08-07")


def test_invalid_date_format_rejected():
    with pytest.raises(ValueError, match="Invalid start_date format"):
        validate_weather_request(17.3850, 78.4867, "2026/08/01", "2026-08-07")

    with pytest.raises(ValueError, match="Invalid end_date format"):
        validate_weather_request(17.3850, 78.4867, "2026-08-01", "not-a-date")


def test_start_date_after_end_date_rejected():
    with pytest.raises(ValueError, match="start_date must be less than or equal to end_date"):
        validate_weather_request(17.3850, 78.4867, "2026-08-08", "2026-08-01")


def test_date_range_exceeds_31_days_rejected():
    # 32 days: 2026-08-01 to 2026-09-01
    with pytest.raises(ValueError, match="Date range exceeds 31 days"):
        validate_weather_request(17.3850, 78.4867, "2026-08-01", "2026-09-01")
