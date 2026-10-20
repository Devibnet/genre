"""Tests for Program News endpoints."""

from tests.conftest import create_result_mock


def test_get_public_news_list(client, mock_supabase_client):
    """Test public news listing."""
    mock_table = mock_supabase_client.table("program_news")
    mock_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.side_effect = lambda: create_result_mock(
        count=1,
        data=[{
            "id": "news-uuid-1",
            "title": "Sosialisasi GenRe Ceria Buleleng",
            "slug": "sosialisasi-genre-ceria-buleleng",
            "description": "Kegiatan sosialisasi di SMA N 1 Singaraja.",
            "event_date": "2026-08-05",
            "cover_url": "news/cover-1.webp",
            "status": "published",
            "published_at": "2026-08-05T10:00:00Z",
            "created_at": "2026-08-05T10:00:00Z"
        }]
    )

    response = client.get("/api/v1/news")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"][0]["slug"] == "sosialisasi-genre-ceria-buleleng"


def test_create_news_admin(client, admin_auth_headers, mock_supabase_client):
    """Test news creation by admin."""
    mock_table = mock_supabase_client.table("program_news")
    mock_table.select.return_value.eq.return_value.execute.side_effect = lambda: create_result_mock(data=[])
    mock_table.insert.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "news-uuid-new",
            "title": "Kegiatan Jambore GenRe",
            "slug": "kegiatan-jambore-genre",
            "description": "Deskripsi jambore",
            "event_date": "2026-08-20",
            "cover_url": None,
            "status": "draft",
            "created_by": "profile-admin-uuid-456",
            "created_at": "2026-08-10T10:00:00Z",
            "updated_at": "2026-08-10T10:00:00Z",
            "published_at": None
        }]
    )

    payload = {
        "title": "Kegiatan Jambore GenRe",
        "description": "Deskripsi jambore",
        "event_date": "2026-08-20"
    }

    response = client.post("/api/v1/admin/news", json=payload, headers=admin_auth_headers)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["title"] == "Kegiatan Jambore GenRe"
