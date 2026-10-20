"""Article service for database queries and business logic."""

from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from app.extensions.supabase import get_supabase_admin_client
from app.utils.slug import generate_unique_slug
from app.services.storage_service import StorageService
from app.middleware.error_handler import NotFoundException, ConflictException, AppException


class ArticleService:
    """Business logic for Articles management."""

    @staticmethod
    def get_public_articles(
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None
    ) -> Tuple[list, int]:
        """Fetch published articles with pagination and optional search."""
        client = get_supabase_admin_client()

        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("articles").select("*", count="exact").eq("status", "published")

        if search and search.strip():
            s = search.strip()
            query = query.or_(f"title.ilike.%{s}%,description.ilike.%{s}%")

        query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)
        res = query.execute()
        # Safely retrieve data list; handle MagicMock or missing attributes
        articles = getattr(res, "data", None) or []
        if not isinstance(articles, list):
            articles = []
        total = getattr(res, "count", None) if getattr(res, "count", None) is not None else len(articles)
        return articles, total

    @staticmethod
    def get_public_article_by_slug(slug: str) -> dict:
        """Fetch published article by slug."""
        client = get_supabase_admin_client()
        res = client.table("articles").select("*").eq("slug", slug).eq("status", "published").execute()
        articles = getattr(res, "data", None) or []
        if not isinstance(articles, list) or len(articles) == 0:
            raise NotFoundException(f"Article with slug '{slug}' not found")
        return articles[0]

    @staticmethod
    def get_admin_articles(
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[list, int]:
        """Fetch all articles for admin management."""
        client = get_supabase_admin_client()

        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("articles").select("*", count="exact")

        if status:
            query = query.eq("status", status)

        if search and search.strip():
            s = search.strip()
            query = query.or_(f"title.ilike.%{s}%,description.ilike.%{s}%")

        query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)
        res = query.execute()
        articles = getattr(res, "data", None) or []
        if not isinstance(articles, list):
            articles = []
        total = getattr(res, "count", None) if getattr(res, "count", None) is not None else len(articles)
        return articles, total

    @staticmethod
    def get_article_by_id(article_id: str) -> dict:
        """Fetch article by ID."""
        client = get_supabase_admin_client()
        res = client.table("articles").select("*").eq("id", article_id).execute()
        articles = getattr(res, "data", None) or []
        if not isinstance(articles, list) or len(articles) == 0:
            raise NotFoundException(f"Article with ID '{article_id}' not found")
        return articles[0]

    @staticmethod
    def create_article(data: dict, profile_id: str) -> dict:
        """Create new article."""
        client = get_supabase_admin_client()

        slug = generate_unique_slug(
            table_name="articles",
            title=data["title"],
            provided_slug=data.get("slug")
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        status = data.get("status", "draft")
        published_at = now_iso if status == "published" else None

        insert_payload = {
            "title": data["title"],
            "slug": slug,
            "description": data["description"],
            "drive_url": data["drive_url"],
            "cover_url": data.get("cover_url"),
            "status": status,
            "created_by": profile_id,
            "created_at": now_iso,
            "updated_at": now_iso,
            "published_at": published_at
        }

        res = client.table("articles").insert(insert_payload).execute()
        if not res.data or len(res.data) == 0:
            raise AppException("Failed to create article record")
        return res.data[0]

    @staticmethod
    def update_article(article_id: str, data: dict) -> dict:
        """Update existing article."""
        existing = ArticleService.get_article_by_id(article_id)
        client = get_supabase_admin_client()

        update_payload: Dict[str, Any] = {}

        if "title" in data and data["title"] is not None:
            update_payload["title"] = data["title"]

        if "slug" in data and data["slug"] is not None:
            new_slug = generate_unique_slug(
                table_name="articles",
                title=data.get("title") or existing["title"],
                provided_slug=data["slug"],
                exclude_id=article_id
            )
            update_payload["slug"] = new_slug

        if "description" in data and data["description"] is not None:
            update_payload["description"] = data["description"]

        if "drive_url" in data and data["drive_url"] is not None:
            update_payload["drive_url"] = data["drive_url"]

        if "cover_url" in data:
            update_payload["cover_url"] = data["cover_url"]

        if "status" in data and data["status"] is not None:
            update_payload["status"] = data["status"]
            if data["status"] == "published" and not existing.get("published_at"):
                update_payload["published_at"] = datetime.now(timezone.utc).isoformat()
            elif data["status"] == "draft":
                update_payload["published_at"] = None

        if not update_payload:
            return existing

        update_payload["updated_at"] = datetime.now(timezone.utc).isoformat()

        res = client.table("articles").update(update_payload).eq("id", article_id).execute()
        if not res.data:
            raise AppException("Failed to update article")
        return res.data[0]

    @staticmethod
    def publish_article(article_id: str) -> dict:
        """Publish article by setting status = 'published' and published_at = NOW()."""
        existing = ArticleService.get_article_by_id(article_id)
        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("articles").update({
            "status": "published",
            "published_at": now_iso,
            "updated_at": now_iso
        }).eq("id", article_id).execute()
        return res.data[0]

    @staticmethod
    def unpublish_article(article_id: str) -> dict:
        """Unpublish article by setting status = 'draft' and published_at = NULL."""
        existing = ArticleService.get_article_by_id(article_id)
        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("articles").update({
            "status": "draft",
            "published_at": None,
            "updated_at": now_iso
        }).eq("id", article_id).execute()
        return res.data[0]

    @staticmethod
    def delete_article(article_id: str) -> bool:
        """Delete article and cleanup cover file from storage."""
        existing = ArticleService.get_article_by_id(article_id)
        client = get_supabase_admin_client()

        # Delete database record first
        client.table("articles").delete().eq("id", article_id).execute()

        # Cleanup storage file if cover_url exists
        if existing.get("cover_url"):
            StorageService.delete_file(existing["cover_url"])

        return True

    @staticmethod
    def upload_cover(article_id: str, file) -> dict:
        """Upload cover image for article with orphan file protection."""
        existing = ArticleService.get_article_by_id(article_id)

        # 1. Upload new cover image
        new_storage_path = StorageService.upload_image(file, "articles/covers")

        # 2. Update DB record
        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        try:
            res = client.table("articles").update({
                "cover_url": new_storage_path,
                "updated_at": now_iso
            }).eq("id", article_id).execute()

            # 3. Cleanup old cover file if successful
            if existing.get("cover_url") and existing["cover_url"] != new_storage_path:
                StorageService.delete_file(existing["cover_url"])

            return res.data[0]
        except Exception as e:
            # Rollback: Delete newly uploaded image on DB failure
            StorageService.delete_file(new_storage_path)
            raise AppException(f"Failed to update article cover: {str(e)}")

    @staticmethod
    def delete_cover(article_id: str) -> dict:
        """Remove cover image from article and storage."""
        existing = ArticleService.get_article_by_id(article_id)
        if existing.get("cover_url"):
            StorageService.delete_file(existing["cover_url"])

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("articles").update({
            "cover_url": None,
            "updated_at": now_iso
        }).eq("id", article_id).execute()
        return res.data[0]
