"""Program News service handling news articles and photo documentation."""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from app.extensions.supabase import get_supabase_admin_client
from app.utils.slug import generate_unique_slug
from app.services.storage_service import StorageService
from app.middleware.error_handler import NotFoundException, AppException


class NewsService:
    """Business logic for Program News and Documentation Photos."""

    @staticmethod
    def get_public_news(
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None
    ) -> Tuple[list, int]:
        """Fetch published program news sorted by event_date DESC."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("program_news").select("*", count="exact").eq("status", "published")

        if search and search.strip():
            s = search.strip()
            query = query.or_(f"title.ilike.%{s}%,description.ilike.%{s}%")

        query = query.order("event_date", desc=True).range(offset, offset + per_page - 1)
        res = query.execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_public_news_by_slug(slug: str) -> Tuple[dict, list]:
        """Fetch published news by slug along with documentation photos."""
        client = get_supabase_admin_client()
        res = client.table("program_news").select("*").eq("slug", slug).eq("status", "published").execute()
        if not res.data or len(res.data) == 0:
            raise NotFoundException(f"News with slug '{slug}' not found")
        news = res.data[0]

        photos_res = client.table("program_news_photos").select("*").eq("news_id", news["id"]).order("order_number", desc=False).execute()
        return news, photos_res.data or []

    @staticmethod
    def get_admin_news(
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[list, int]:
        """Fetch all news for admin management."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("program_news").select("*", count="exact")

        if status:
            query = query.eq("status", status)

        if search and search.strip():
            s = search.strip()
            query = query.or_(f"title.ilike.%{s}%,description.ilike.%{s}%")

        query = query.order("event_date", desc=True).range(offset, offset + per_page - 1)
        res = query.execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_news_by_id(news_id: str) -> Tuple[dict, list]:
        """Fetch news by ID along with documentation photos."""
        client = get_supabase_admin_client()
        res = client.table("program_news").select("*").eq("id", news_id).execute()
        if not res.data or len(res.data) == 0:
            raise NotFoundException(f"News with ID '{news_id}' not found")
        news = res.data[0]

        photos_res = client.table("program_news_photos").select("*").eq("news_id", news_id).order("order_number", desc=False).execute()
        return news, photos_res.data or []

    @staticmethod
    def create_news(data: dict, profile_id: str) -> dict:
        """Create a new program news."""
        client = get_supabase_admin_client()

        slug = generate_unique_slug(
            table_name="program_news",
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
            "event_date": data["event_date"],
            "cover_url": data.get("cover_url"),
            "status": status,
            "created_by": profile_id,
            "created_at": now_iso,
            "updated_at": now_iso,
            "published_at": published_at
        }

        res = client.table("program_news").insert(insert_payload).execute()
        if not res.data:
            raise AppException("Failed to create program news")
        return res.data[0]

    @staticmethod
    def update_news(news_id: str, data: dict) -> dict:
        """Update existing program news."""
        news, _ = NewsService.get_news_by_id(news_id)
        client = get_supabase_admin_client()

        update_payload: Dict[str, Any] = {}

        if "title" in data and data["title"] is not None:
            update_payload["title"] = data["title"]

        if "slug" in data and data["slug"] is not None:
            new_slug = generate_unique_slug(
                table_name="program_news",
                title=data.get("title") or news["title"],
                provided_slug=data["slug"],
                exclude_id=news_id
            )
            update_payload["slug"] = new_slug

        if "description" in data and data["description"] is not None:
            update_payload["description"] = data["description"]

        if "event_date" in data and data["event_date"] is not None:
            update_payload["event_date"] = data["event_date"]

        if "cover_url" in data:
            update_payload["cover_url"] = data["cover_url"]

        if "status" in data and data["status"] is not None:
            update_payload["status"] = data["status"]
            if data["status"] == "published" and not news.get("published_at"):
                update_payload["published_at"] = datetime.now(timezone.utc).isoformat()
            elif data["status"] == "draft":
                update_payload["published_at"] = None

        if not update_payload:
            return news

        update_payload["updated_at"] = datetime.now(timezone.utc).isoformat()
        res = client.table("program_news").update(update_payload).eq("id", news_id).execute()
        return res.data[0]

    @staticmethod
    def publish_news(news_id: str) -> dict:
        """Publish news item."""
        news, _ = NewsService.get_news_by_id(news_id)
        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("program_news").update({
            "status": "published",
            "published_at": now_iso,
            "updated_at": now_iso
        }).eq("id", news_id).execute()
        return res.data[0]

    @staticmethod
    def unpublish_news(news_id: str) -> dict:
        """Unpublish news item."""
        news, _ = NewsService.get_news_by_id(news_id)
        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("program_news").update({
            "status": "draft",
            "published_at": None,
            "updated_at": now_iso
        }).eq("id", news_id).execute()
        return res.data[0]

    @staticmethod
    def delete_news(news_id: str) -> bool:
        """Delete news and clean up all associated cover and photo files."""
        news, photos = NewsService.get_news_by_id(news_id)
        client = get_supabase_admin_client()

        # Delete database records
        client.table("program_news_photos").delete().eq("news_id", news_id).execute()
        client.table("program_news").delete().eq("id", news_id).execute()

        # Cleanup storage files
        if news.get("cover_url"):
            StorageService.delete_file(news["cover_url"])
        for p in photos:
            if p.get("image_url"):
                StorageService.delete_file(p["image_url"])

        return True

    @staticmethod
    def upload_cover(news_id: str, file) -> dict:
        """Upload cover image for program news."""
        news, _ = NewsService.get_news_by_id(news_id)

        new_storage_path = StorageService.upload_image(file, "news")

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        try:
            res = client.table("program_news").update({
                "cover_url": new_storage_path,
                "updated_at": now_iso
            }).eq("id", news_id).execute()

            if news.get("cover_url") and news["cover_url"] != new_storage_path:
                StorageService.delete_file(news["cover_url"])

            return res.data[0]
        except Exception as e:
            StorageService.delete_file(new_storage_path)
            raise AppException(f"Failed to update news cover: {str(e)}")

    @staticmethod
    def delete_cover(news_id: str) -> dict:
        """Delete news cover image."""
        news, _ = NewsService.get_news_by_id(news_id)
        if news.get("cover_url"):
            StorageService.delete_file(news["cover_url"])

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("program_news").update({
            "cover_url": None,
            "updated_at": now_iso
        }).eq("id", news_id).execute()
        return res.data[0]

    # --- News Photos Logic ---

    @staticmethod
    def add_news_photo(news_id: str, file, caption: Optional[str] = None, order_number: int = 1) -> dict:
        """Upload and add a photo to program news."""
        NewsService.get_news_by_id(news_id)

        storage_path = StorageService.upload_image(file, "news")

        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "news_id": news_id,
            "image_url": storage_path,
            "caption": caption,
            "order_number": order_number,
            "created_at": now_iso
        }

        try:
            res = client.table("program_news_photos").insert(payload).execute()
            return res.data[0]
        except Exception as e:
            StorageService.delete_file(storage_path)
            raise AppException(f"Failed to save news photo record: {str(e)}")

    @staticmethod
    def update_news_photo(photo_id: str, caption: Optional[str] = None, order_number: Optional[int] = None) -> dict:
        """Update photo caption or order number."""
        client = get_supabase_admin_client()
        p_res = client.table("program_news_photos").select("*").eq("id", photo_id).execute()
        if not p_res.data:
            raise NotFoundException(f"News photo with ID '{photo_id}' not found")

        update_payload = {}
        if caption is not None:
            update_payload["caption"] = caption
        if order_number is not None:
            update_payload["order_number"] = order_number

        if not update_payload:
            return p_res.data[0]

        res = client.table("program_news_photos").update(update_payload).eq("id", photo_id).execute()
        return res.data[0]

    @staticmethod
    def delete_news_photo(photo_id: str) -> bool:
        """Delete news photo record and file from storage."""
        client = get_supabase_admin_client()
        p_res = client.table("program_news_photos").select("*").eq("id", photo_id).execute()
        if not p_res.data:
            raise NotFoundException(f"News photo with ID '{photo_id}' not found")
        photo = p_res.data[0]

        client.table("program_news_photos").delete().eq("id", photo_id).execute()
        if photo.get("image_url"):
            StorageService.delete_file(photo["image_url"])

        return True
