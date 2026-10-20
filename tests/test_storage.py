"""Tests for storage validation and storage service."""

import pytest
import io
from werkzeug.datastructures import FileStorage
from app.utils.storage import validate_image_file, generate_storage_path, build_public_url
from app.middleware.error_handler import ValidationException


def test_validate_valid_image():
    """Test validating valid image file."""
    file = FileStorage(
        stream=io.BytesIO(b"fake image data"),
        filename="test.png",
        content_type="image/png"
    )
    content_type, ext = validate_image_file(file)
    assert content_type == "image/png"
    assert ext == ".png"


def test_validate_invalid_extension():
    """Test validating disallowed file extension."""
    file = FileStorage(
        stream=io.BytesIO(b"fake pdf content"),
        filename="document.pdf",
        content_type="application/pdf"
    )
    with pytest.raises(ValidationException) as exc_info:
        validate_image_file(file)
    assert "Invalid file extension" in str(exc_info.value)


def test_validate_invalid_mime():
    """Test validating file with disallowed MIME type."""
    file = FileStorage(
        stream=io.BytesIO(b"fake text content"),
        filename="image.png",
        content_type="text/plain"
    )
    with pytest.raises(ValidationException) as exc_info:
        validate_image_file(file)
    assert "Invalid MIME type" in str(exc_info.value)


def test_validate_oversized_file():
    """Test file exceeding 5MB size limit."""
    oversized_data = b"0" * (6 * 1024 * 1024)  # 6 MB
    file = FileStorage(
        stream=io.BytesIO(oversized_data),
        filename="large.jpg",
        content_type="image/jpeg"
    )
    with pytest.raises(ValidationException) as exc_info:
        validate_image_file(file)
    assert "exceeds maximum limit" in str(exc_info.value)


def test_generate_storage_path():
    """Test UUID storage path generator."""
    path = generate_storage_path("gallery", ".webp")
    assert path.startswith("gallery/")
    assert path.endswith(".webp")
    assert len(path.split("/")[1]) > 20


def test_build_public_url():
    """Test formatting relative path to Supabase Storage public URL."""
    url = build_public_url("gallery/550e8400-e29b-41d4-a716-446655440000.webp")
    assert "gallery/550e8400-e29b-41d4-a716-446655440000.webp" in url
    assert "/storage/v1/object/public/website/" in url
