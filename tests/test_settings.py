"""Tests for Site Settings and Homepage aggregation endpoints."""

from unittest.mock import MagicMock


def test_get_public_settings(client, mock_supabase_client):
    """Test fetching public site settings."""
    mock_table = mock_supabase_client.table("site_settings")
    mock_table.select.return_value.execute.return_value = MagicMock(
        data=[{
            "id": "settings-uuid-1",
            "site_name": "Forum GenRe Kabupaten Buleleng",
            "description": "Website Resmi GenRe Buleleng",
            "address": "Singaraja, Bali",
            "email": "genre.buleleng@gmail.com",
            "phone": "08123456789",
            "instagram_url": "https://instagram.com/genrebuleleng",
            "logo_url": "site/logo/logo.png",
            "updated_at": "2026-08-01T00:00:00Z"
        }]
    )

    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["site_name"] == "Forum GenRe Kabupaten Buleleng"
    assert json_data["data"]["email"] == "genre.buleleng@gmail.com"


def test_get_homepage_data(client, mock_supabase_client):
    """Test aggregated homepage endpoint /api/v1/home."""
    # Settings table
    s_table = mock_supabase_client.table("site_settings")
    s_table.select.return_value.execute.return_value = MagicMock(data=[{
        "id": "settings-1",
        "site_name": "Forum GenRe Buleleng",
        "updated_at": "2026-08-01T00:00:00Z"
    }])

    # Articles table
    a_table = mock_supabase_client.table("articles")
    a_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        count=0, data=[]
    )

    # News table
    n_table = mock_supabase_client.table("program_news")
    n_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        count=0, data=[]
    )

    # Gallery table
    g_table = mock_supabase_client.table("gallery")
    g_table.select.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        count=0, data=[]
    )

    # Counselors table
    c_table = mock_supabase_client.table("counselors")
    c_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        count=0, data=[]
    )

    response = client.get("/api/v1/home")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "settings" in json_data["data"]
    assert "featured_articles" in json_data["data"]
    assert "latest_news" in json_data["data"]
    assert "featured_gallery" in json_data["data"]
    assert "featured_counselors" in json_data["data"]
