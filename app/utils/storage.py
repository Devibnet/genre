"""Storage validation and URL formatting utilities."""

import os
import uuid
from typing import Tuple, Optional
from werkzeug.datastructures import FileStorage
from app.config.settings import get_config
from app.middleware.error_handler import ValidationException

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_image_file(
    file: FileStorage,
    max_size: int = MAX_FILE_SIZE_BYTES
) -> Tuple[str, str]:
    """Validate uploaded file for presence, MIME type, extension, and file size.

    Returns:
        Tuple of (content_type, extension)
    """
    if not file or not file.filename:
        raise ValidationException("No file provided for upload")

    # Check extension
    filename = file.filename.lower()
    _, ext = os.path.splitext(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationException(
            f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Check MIME type
    content_type = file.mimetype or file.content_type
    if content_type not in ALLOWED_MIME_TYPES:
        raise ValidationException(
            f"Invalid MIME type '{content_type}'. Allowed MIME types: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
        )

    # Check file size (seek to end to measure length, then reset stream position)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationException(f"File size exceeds maximum limit of {max_mb:.1f} MB")

    return content_type, ext


def generate_storage_path(folder: str, extension: str) -> str:
    """Generate a unique UUID-based storage path inside the given folder."""
    clean_folder = folder.strip("/")
    ext = extension if extension.startswith(".") else f".{extension}"
    unique_id = str(uuid.uuid4())
    return f"{clean_folder}/{unique_id}{ext}"


def build_public_url(storage_path: Optional[str]) -> Optional[str]:
    """Convert relative storage path into a full Supabase Storage public URL."""
    if not storage_path:
        return None

    # If it's already a full URL (e.g. http:// or https://), return as is
    if storage_path.startswith("http://") or storage_path.startswith("https://"):
        return storage_path

    cfg = get_config()
    supabase_url = cfg.SUPABASE_URL.rstrip("/")
    bucket = cfg.SUPABASE_STORAGE_BUCKET.strip("/")
    clean_path = storage_path.lstrip("/")

    return f"{supabase_url}/storage/v1/object/public/{bucket}/{clean_path}"
