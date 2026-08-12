from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    port: int = 8000
    frontend_origin: str = "http://localhost:3000"
    gcs_bucket_name: Optional[str] = None
    google_cloud_project: Optional[str] = None
    open_meteo_base_url: str = "https://archive-api.open-meteo.com/v1/archive"
    use_local_storage: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

