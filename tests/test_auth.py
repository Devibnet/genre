"""Tests for authentication middleware and auth endpoints."""

from unittest.mock import MagicMock


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "ok"


def test_auth_me_without_token(client):
    """Test /api/v1/auth/me without authorization header."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    json_data = response.get_json()
    assert json_data["success"] is False
    assert json_data["error"]["code"] == "UNAUTHORIZED"


def test_auth_me_with_invalid_token_format(client):
    """Test /api/v1/auth/me with malformed authorization header."""
    response = client.get("/api/v1/auth/me", headers={"Authorization": "InvalidTokenFormat"})
    assert response.status_code == 401


def test_auth_me_with_non_admin_role(client, mock_supabase_client):
    """Test /api/v1/admin/articles with non-admin user role."""
    mock_user = MagicMock()
    mock_user.id = "user-uuid-999"
    mock_supabase_client.auth.get_user.return_value = MagicMock(user=mock_user)

    mock_table = mock_supabase_client.table("profiles")
    mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": "profile-uuid-999",
            "user_id": "user-uuid-999",
            "name": "Public User",
            "role": "public"
        }]
    )

    response = client.get("/api/v1/admin/articles", headers={"Authorization": "Bearer some-token"})
    assert response.status_code == 403
    json_data = response.get_json()
    assert json_data["error"]["code"] == "FORBIDDEN"


def test_auth_me_success(client, admin_auth_headers):
    """Test /api/v1/auth/me with valid admin token."""
    response = client.get("/api/v1/auth/me", headers=admin_auth_headers)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["user"]["id"] == "admin-user-uuid-123"
    assert json_data["data"]["profile"]["role"] == "admin"
