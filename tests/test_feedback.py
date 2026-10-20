"""Unit & Integration tests for Feedback endpoints (Public and Admin)."""

import pytest
from tests.conftest import create_result_mock


def test_public_submit_feedback_success(client, mock_supabase_client):
    """Test public visitor submits feedback successfully without authentication."""
    fb_mock = mock_supabase_client.table("feedback")
    fb_mock.insert.return_value.execute.return_value = create_result_mock(
        data=[{
            "id": "fb-uuid-1",
            "name": "Angga Prabaswara",
            "message": "Website sangat informatif dan bermanfaat untuk remaja!",
            "created_at": "2026-08-26T10:00:00Z"
        }]
    )

    payload = {
        "name": "Angga Prabaswara",
        "message": "Website sangat informatif dan bermanfaat untuk remaja!"
    }
    res = client.post("/api/v1/feedback", json=payload)
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["message"] == "Feedback berhasil dikirim."
    assert json_data["data"]["id"] == "fb-uuid-1"
    assert json_data["data"]["name"] == "Angga Prabaswara"


def test_public_submit_feedback_validation_error(client):
    """Test validation errors for empty fields or whitespace."""
    # Test empty name
    res = client.post("/api/v1/feedback", json={"name": "   ", "message": "Pesan valid"})
    assert res.status_code == 422
    assert res.get_json()["success"] is False

    # Test empty message
    res = client.post("/api/v1/feedback", json={"name": "Budi", "message": "   "})
    assert res.status_code == 422
    assert res.get_json()["success"] is False

    # Test missing fields
    res = client.post("/api/v1/feedback", json={})
    assert res.status_code == 422
    assert res.get_json()["success"] is False


def test_admin_get_feedback_unauthorized(client):
    """Test that public cannot access admin feedback endpoint without token."""
    res = client.get("/api/v1/admin/feedback")
    assert res.status_code == 401


def test_admin_get_feedback_success(client, mock_supabase_client, admin_auth_headers):
    """Test admin can retrieve feedback list with pagination."""
    fb_mock = mock_supabase_client.table("feedback")
    fb_mock.select.return_value.order.return_value.range.return_value.execute.return_value = create_result_mock(
        data=[
            {"id": "fb-uuid-1", "name": "Budi", "message": "Saran 1", "created_at": "2026-08-26T10:00:00Z"},
            {"id": "fb-uuid-2", "name": "Siti", "message": "Saran 2", "created_at": "2026-08-25T10:00:00Z"},
        ],
        count=2
    )

    res = client.get("/api/v1/admin/feedback?page=1&per_page=10", headers=admin_auth_headers)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert len(json_data["data"]) == 2
    assert json_data["meta"]["total"] == 2
    assert json_data["meta"]["page"] == 1


def test_admin_get_single_feedback_success(client, mock_supabase_client, admin_auth_headers):
    """Test admin can view single feedback detail."""
    fb_mock = mock_supabase_client.table("feedback")
    fb_mock.select.return_value.eq.return_value.execute.return_value = create_result_mock(
        data=[{"id": "fb-uuid-1", "name": "Budi", "message": "Saran lengkap", "created_at": "2026-08-26T10:00:00Z"}]
    )

    res = client.get("/api/v1/admin/feedback/fb-uuid-1", headers=admin_auth_headers)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["id"] == "fb-uuid-1"
    assert json_data["data"]["name"] == "Budi"


def test_admin_delete_feedback_success(client, mock_supabase_client, admin_auth_headers):
    """Test admin can delete feedback."""
    fb_mock = mock_supabase_client.table("feedback")
    # For get_by_id check
    fb_mock.select.return_value.eq.return_value.execute.return_value = create_result_mock(
        data=[{"id": "fb-uuid-1", "name": "Budi", "message": "Saran", "created_at": "2026-08-26T10:00:00Z"}]
    )
    # For delete
    fb_mock.delete.return_value.eq.return_value.execute.return_value = create_result_mock(data=[])

    res = client.delete("/api/v1/admin/feedback/fb-uuid-1", headers=admin_auth_headers)
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["success"] is True
    assert json_data["message"] == "Feedback berhasil dihapus"
