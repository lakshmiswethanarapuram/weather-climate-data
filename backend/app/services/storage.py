import json
import os
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from google.cloud import storage
from google.auth.exceptions import DefaultCredentialsError

from app.config import settings

SAFE_FILENAME_REGEX = re.compile(r"^weather_[a-zA-Z0-9_\-\.]+\.json$")


def validate_filename_safety(filename: str) -> bool:
    """
    Validates that filename is safe, ends with .json, matches expected pattern,
    and prevents path traversal attacks.
    """
    if not filename or ".." in filename or "/" in filename or "\\" in filename:
        return False
    return bool(SAFE_FILENAME_REGEX.match(filename))


class StorageService:
    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or settings.gcs_bucket_name
        self.use_local = settings.use_local_storage or not self.bucket_name
        self.local_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".gcs_local")

        self.gcs_client: Optional[storage.Client] = None
        if not self.use_local and self.bucket_name:
            try:
                self.gcs_client = storage.Client(project=settings.google_cloud_project)
            except (DefaultCredentialsError, Exception) as err:
                # If credentials fail locally, fallback to local storage with a warning
                print(f"[StorageService] GCP Credentials notice: {err}. Falling back to local storage directory.")
                self.use_local = True

        if self.use_local:
            os.makedirs(self.local_dir, exist_ok=True)

    @staticmethod
    def generate_filename(latitude: float, longitude: float, start_date: str, end_date: str) -> str:
        """
        Generates deterministic timestamped filename matching:
        weather_<lat>_<lon>_<start>_<end>_<timestamp>.json
        Example: weather_17.3850_78.4867_2026-08-01_2026-08-07_20260812183000.json
        """
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        # Format lat/lon cleanly
        lat_str = f"{latitude:.4f}" if isinstance(latitude, float) else str(latitude)
        lon_str = f"{longitude:.4f}" if isinstance(longitude, float) else str(longitude)
        return f"weather_{lat_str}_{lon_str}_{start_date}_{end_date}_{timestamp}.json"

    def store_json(self, filename: str, data: Dict[str, Any]) -> str:
        if not validate_filename_safety(filename):
            raise ValueError(f"Invalid filename: {filename}")

        json_bytes = json.dumps(data, indent=2).encode("utf-8")

        if self.use_local:
            file_path = os.path.join(self.local_dir, filename)
            with open(file_path, "wb") as f:
                f.write(json_bytes)
            return filename

        try:
            bucket = self.gcs_client.bucket(self.bucket_name)
            blob = bucket.blob(filename)
            blob.upload_from_string(json_bytes, content_type="application/json")
            return filename
        except Exception as e:
            raise RuntimeError(f"Google Cloud Storage upload failed: {str(e)}")

    def list_files(self) -> List[Dict[str, Any]]:
        if self.use_local:
            files = []
            if not os.path.exists(self.local_dir):
                return []
            for fname in os.listdir(self.local_dir):
                if validate_filename_safety(fname):
                    fpath = os.path.join(self.local_dir, fname)
                    stat = os.stat(fpath)
                    created_at = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
                    files.append({
                        "name": fname,
                        "size": stat.st_size,
                        "created_at": created_at
                    })
            # Sort newest first
            files.sort(key=lambda x: x["created_at"], reverse=True)
            return files

        try:
            bucket = self.gcs_client.bucket(self.bucket_name)
            blobs = bucket.list_blobs()
            files = []
            for blob in blobs:
                if validate_filename_safety(blob.name):
                    created_at = blob.time_created.isoformat() if blob.time_created else datetime.now(timezone.utc).isoformat()
                    files.append({
                        "name": blob.name,
                        "size": blob.size or 0,
                        "created_at": created_at
                    })
            # Sort newest first
            files.sort(key=lambda x: x["created_at"], reverse=True)
            return files
        except Exception as e:
            raise RuntimeError(f"Failed to list Google Cloud Storage objects: {str(e)}")

    def get_file_content(self, filename: str) -> Optional[Dict[str, Any]]:
        if not validate_filename_safety(filename):
            raise ValueError(f"Invalid or unsafe filename: {filename}")

        if self.use_local:
            file_path = os.path.join(self.local_dir, filename)
            if not os.path.isfile(file_path):
                return None
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)

        try:
            bucket = self.gcs_client.bucket(self.bucket_name)
            blob = bucket.blob(filename)
            if not blob.exists():
                return None
            content_str = blob.download_as_text(encoding="utf-8")
            return json.loads(content_str)
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve Google Cloud Storage file content: {str(e)}")
