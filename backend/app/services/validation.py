from datetime import datetime
from typing import Tuple


def validate_weather_request(latitude: float, longitude: float, start_date_str: str, end_date_str: str) -> None:
    """
    Validates weather request inputs according to specified business rules.
    Raises ValueError with user-friendly error messages if validation fails.
    """
    # 1. Validate latitude
    if not (-90.0 <= latitude <= 90.0):
        raise ValueError("Latitude must be between -90 and 90.")

    # 2. Validate longitude
    if not (-180.0 <= longitude <= 180.0):
        raise ValueError("Longitude must be between -180 and 180.")

    # 3. Validate start date format
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ValueError("Invalid start_date format. Must be YYYY-MM-DD.")

    # 4. Validate end date format
    try:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ValueError("Invalid end_date format. Must be YYYY-MM-DD.")

    # 5. Check start_date <= end_date
    if start_date > end_date:
        raise ValueError("start_date must be less than or equal to end_date.")

    # 6. Check date range does not exceed 31 calendar days
    calendar_days = (end_date - start_date).days + 1
    if calendar_days > 31:
        raise ValueError(f"Date range exceeds 31 days ({calendar_days} calendar days requested).")
