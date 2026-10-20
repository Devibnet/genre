"""Pytest fixtures and test environment setup."""

import pytest
import os
from unittest.mock import MagicMock
from app import create_app
from app.config.settings import TestingConfig
from app.extensions.supabase import reset_supabase_clients


@pytest.fixture
def app():
    """Create Flask application instance for testing."""
    os.environ["FLASK_ENV"] = "testing"
    reset_supabase_clients()
    application = create_app(config_class=TestingConfig)
    yield application


@pytest.fixture
def client(app):
    """Create Flask test client."""
    return app.test_client()


def create_result_mock(data=None, count=None):
    """Helper to construct a mock Supabase response object with data and count attributes."""
    res = MagicMock()
    res.data = data if data is not None else []
    res.count = count if count is not None else len(res.data)
    return res


@pytest.fixture
def mock_supabase_client(mocker):
    """Mock Supabase admin client and its chained methods."""
    mock_client = MagicMock()
    tables_map = {}

    def get_table_mock(table_name: str):
        if table_name not in tables_map:
            t_mock = MagicMock()
            tables_map[table_name] = t_mock
        return tables_map[table_name]

    mock_client.table.side_effect = get_table_mock

    # Setup default profiles table mock
    prof_mock = get_table_mock("profiles")
    prof_mock.select.return_value.eq.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "profile-admin-uuid-456",
            "user_id": "admin-user-uuid-123",
            "name": "Admin GenRe",
            "role": "admin"
        }]
    )

    # Setup default auth user
    default_user = MagicMock()
    default_user.id = "admin-user-uuid-123"
    default_user.email = "admin@genre.bulelengkab.go.id"
    mock_client.auth.get_user.return_value = MagicMock(user=default_user)

    mocker.patch("app.extensions.supabase.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.extensions.supabase.get_supabase_client", return_value=mock_client)
    mocker.patch("app.extensions.supabase.get_supabase_auth_client", return_value=mock_client)
    mocker.patch("app.middleware.auth.get_supabase_auth_client", return_value=mock_client)
    mocker.patch("app.routes.auth_routes.get_supabase_auth_client", return_value=mock_client)
    mocker.patch("app.services.article_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.quiz_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.news_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.gallery_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.counselor_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.feedback_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.settings_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.middleware.auth.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.services.storage_service.get_supabase_admin_client", return_value=mock_client)
    mocker.patch("app.utils.slug.get_supabase_admin_client", return_value=mock_client)

    return mock_client


@pytest.fixture
def admin_auth_headers(mock_supabase_client):
    """Generate mock headers for an authenticated admin user."""
    mock_user = MagicMock()
    mock_user.id = "admin-user-uuid-123"
    mock_user.email = "admin@genre.bulelengkab.go.id"
    mock_supabase_client.auth.get_user.return_value = MagicMock(user=mock_user)

    prof_mock = mock_supabase_client.table("profiles")
    prof_mock.select.return_value.eq.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "profile-admin-uuid-456",
            "user_id": "admin-user-uuid-123",
            "name": "Admin GenRe",
            "role": "admin"
        }]
    )

    return {"Authorization": "Bearer mock-admin-token-xyz"}
