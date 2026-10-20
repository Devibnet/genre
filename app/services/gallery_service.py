"""Gallery service handling simple photo gallery operations."""

from datetime import datetime, timezone
from typing import Optional, Tuple
from app.extensions.supabase import get_supabase_admin_client
from app.services.storage_service import StorageService
from app.middleware.error_handler import NotFoundException, AppException


class GalleryService:
    """Business logic for Gallery items."""

    @staticmethod
    def get_gallery_items(page: int = 1, per_page: int = 10) -> Tuple[list, int]:
        """Fetch gallery photos sorted by created_at DESC."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        res = client.table("gallery").select("*", count="exact").order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_gallery_by_id(gallery_id: str) -> dict:
        """Fetch gallery item by ID."""
        client = get_supabase_admin_client()
        res = client.table("gallery").select("*").eq("id", gallery_id).execute()
        if not res.data or len(res.data) == 0:
            raise NotFoundException(f"Gallery item with ID '{gallery_id}' not found")
        return res.data[0]

    @staticmethod
    def create_gallery_item(file, caption: str, profile_id: str) -> dict:
        """Upload photo and create gallery entry with orphan file protection."""
        storage_path = StorageService.upload_image(file, "gallery")

        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "image_url": storage_path,
            "caption": caption,
            "created_by": profile_id,
            "created_at": now_iso
        }

        try:
            res = client.table("gallery").insert(payload).execute()
            return res.data[0]
        except Exception as e:
            StorageService.delete_file(storage_path)
            raise AppException(f"Failed to create gallery record: {str(e)}")

    @staticmethod
    def update_gallery_item(gallery_id: str, caption: str) -> dict:
        """Update gallery caption."""
        GalleryService.get_gallery_by_id(gallery_id)
        client = get_supabase_admin_client()
        res = client.table("gallery").update({"caption": caption}).eq("id", gallery_id).execute()
        return res.data[0]

    @staticmethod
    def delete_gallery_item(gallery_id: str) -> bool:
        """Delete gallery record and storage image."""
        item = GalleryService.get_gallery_by_id(gallery_id)
        client = get_supabase_admin_client()

        client.table("gallery").delete().eq("id", gallery_id).execute()
        if item.get("image_url"):
            StorageService.delete_file(item["image_url"])

        return True
