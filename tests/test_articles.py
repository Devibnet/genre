"""Tests for Article endpoints and business logic."""

from tests.conftest import create_result_mock


def test_get_public_articles(client, mock_supabase_client):
    """Test public articles listing returns published items."""
    mock_table = mock_supabase_client.table("articles")
    mock_table.select.return_value.eq.return_value.order.return_value.range.return_value.execute.side_effect = lambda: create_result_mock(
        count=1,
        data=[{
            "id": "article-uuid-1",
            "title": "Edukasi Stunting Remaja",
            "slug": "edukasi-stunting-remaja",
            "description": "Mencegah stunting sejak usia remaja.",
            "cover_url": "articles/covers/cover-1.webp",
            "drive_url": "https://drive.google.com/file/d/xyz",
            "status": "published",
            "published_at": "2026-08-01T00:00:00Z",
            "created_at": "2026-08-01T00:00:00Z"
        }]
    )

    response = client.get("/api/v1/articles")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert len(json_data["data"]) == 1
    assert json_data["data"][0]["slug"] == "edukasi-stunting-remaja"


def test_get_public_article_by_slug_not_found(client, mock_supabase_client):
    """Test fetching non-existent or draft article via public slug returns 404."""
    mock_table = mock_supabase_client.table("articles")
    mock_table.select.return_value.eq.return_value.eq.return_value.execute.side_effect = lambda: create_result_mock(data=[])

    response = client.get("/api/v1/articles/draft-article-slug")
    assert response.status_code == 404
    json_data = response.get_json()
    assert json_data["success"] is False
    assert json_data["error"]["code"] == "NOT_FOUND"


def test_create_article_admin(client, admin_auth_headers, mock_supabase_client):
    """Test article creation by admin."""
    mock_table = mock_supabase_client.table("articles")
    mock_table.select.return_value.eq.return_value.execute.side_effect = lambda: create_result_mock(data=[])
    mock_table.insert.return_value.execute.side_effect = lambda: create_result_mock(
        data=[{
            "id": "new-article-uuid",
            "title": "Artikel Baru GenRe",
            "slug": "artikel-baru-genre",
            "description": "Deskripsi artikel baru",
            "drive_url": "https://drive.google.com/xyz",
            "cover_url": None,
            "status": "draft",
            "created_by": "profile-admin-uuid-456",
            "created_at": "2026-08-10T10:00:00Z",
            "updated_at": "2026-08-10T10:00:00Z",
            "published_at": None
        }]
    )

    payload = {
        "title": "Artikel Baru GenRe",
        "description": "Deskripsi artikel baru",
        "drive_url": "https://drive.google.com/xyz"
    }

    response = client.post("/api/v1/admin/articles", json=payload, headers=admin_auth_headers)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["success"] is True
    assert json_data["data"]["title"] == "Artikel Baru GenRe"
    assert json_data["data"]["slug"] == "artikel-baru-genre"
