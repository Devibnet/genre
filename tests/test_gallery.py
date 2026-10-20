"""Tests for Gallery endpoints."""

import io
from tests.conftest import create_result_mock


def test_get_public_gallery(client, mock_supabase_client):
    """Test public gallery listing."""
    mock_table = mock_supabase_client.table("gallery")
    mock_table.select.return_value.order.return_value.range.return_value.execute.side_effect = lambda: create_result_mock(
        count=1,
        data=[{
            "id": "gallery-uuid-1",
            "image_url": "gallery/photo-1.webp",
            "caption": "Foto Kegiatan Forum GenRe 2026",
            "created_by": "profile-admin-uuid-456",
            "created_at": "2026-08-01T00:00:00Z"
        }]
    )

    response = client.get("/api/v1/gallery")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"][0]["caption"] == "Foto Kegiatan Forum GenRe 2026"


def test_admin_upload_gallery_item(client, admin_auth_headers, mock_supabase_client, mocker):
    """Test gallery upload by admin."""
    mocker.patch(
        "app.services.storage_service.StorageService.upload_image",
        return_value="gallery/uuid-mock.webp"
    )

    mock_table = mock_supabase_client.table("gallery")
    mock_table.insert.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "gallery-uuid-new",
            "image_url": "gallery/uuid-mock.webp",
            "caption": "Foto Pembukaan GenRe Ceria",
            "created_by": "profile-admin-uuid-456",
            "created_at": "2026-08-10T10:00:00Z"
        }]
    )

    data = {
        "image": (io.BytesIO(b"fake image bytes"), "photo.png"),
        "caption": "Foto Pembukaan GenRe Ceria"
    }

    response = client.post(
        "/api/v1/admin/gallery",
        data=data,
        content_type="multipart/form-data",
        headers=admin_auth_headers
    )

    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["caption"] == "Foto Pembukaan GenRe Ceria"
