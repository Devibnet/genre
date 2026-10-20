"""Tests for Peer Counselor endpoints."""

from tests.conftest import create_result_mock


def test_get_public_counselors_returns_active_only(client, mock_supabase_client):
    """Test public counselors listing returns active status only."""
    mock_table = mock_supabase_client.table("counselors")
    mock_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.side_effect = lambda: create_result_mock(
        count=1,
        data=[{
            "id": "counselor-uuid-1",
            "name": "Kadek Puteri",
            "age": 20,
            "photo_url": "counselors/photo-1.webp",
            "description": "Konselor Sebaya GenRe Buleleng",
            "whatsapp_number": "6281234567890",
            "status": "active",
            "created_at": "2026-08-01T00:00:00Z"
        }]
    )

    response = client.get("/api/v1/counselors")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"][0]["name"] == "Kadek Puteri"
    assert json_data["data"][0]["status"] == "active"


def test_create_counselor_admin_validates_whatsapp(client, admin_auth_headers, mock_supabase_client):
    """Test counselor creation by admin cleans and validates WhatsApp number."""
    mock_table = mock_supabase_client.table("counselors")
    mock_table.insert.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "counselor-new-id",
            "name": "Gede Made",
            "age": 21,
            "description": "Konselor baru",
            "whatsapp_number": "6289876543210",
            "photo_url": None,
            "status": "active",
            "created_at": "2026-08-10T10:00:00Z",
            "updated_at": "2026-08-10T10:00:00Z"
        }]
    )

    payload = {
        "name": "Gede Made",
        "age": 21,
        "description": "Konselor baru",
        "whatsapp_number": "+62 898-7654-3210"
    }

    response = client.post("/api/v1/admin/counselors", json=payload, headers=admin_auth_headers)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["whatsapp_number"] == "6289876543210"
