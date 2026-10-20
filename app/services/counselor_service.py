"""Counselor service for Peer Counselors management."""

from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any
from app.extensions.supabase import get_supabase_admin_client
from app.services.storage_service import StorageService
from app.middleware.error_handler import NotFoundException, AppException


class CounselorService:
    """Business logic for Peer Counselors."""

    @staticmethod
    def get_public_counselors(page: int = 1, per_page: int = 10) -> Tuple[list, int]:
        """Fetch active counselors only."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        res = client.table("counselors").select("*", count="exact").eq("status", "active").order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_admin_counselors(page: int = 1, per_page: int = 10, status: Optional[str] = None) -> Tuple[list, int]:
        """Fetch all counselors for admin management."""
        client = get_supabase_admin_client()
        per_page = min(max(1, per_page), 50)
        page = max(1, page)
        offset = (page - 1) * per_page

        query = client.table("counselors").select("*", count="exact")
        if status:
            query = query.eq("status", status)

        res = query.order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
        total = res.count if res.count is not None else len(res.data or [])
        return res.data or [], total

    @staticmethod
    def get_counselor_by_id(counselor_id: str) -> dict:
        """Fetch counselor by ID."""
        client = get_supabase_admin_client()
        res = client.table("counselors").select("*").eq("id", counselor_id).execute()
        if not res.data or len(res.data) == 0:
            raise NotFoundException(f"Counselor with ID '{counselor_id}' not found")
        return res.data[0]

    @staticmethod
    def create_counselor(data: dict) -> dict:
        """Create new counselor."""
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "name": data["name"],
            "age": data["age"],
            "description": data.get("description"),
            "whatsapp_number": data["whatsapp_number"],
            "status": data.get("status", "active"),
            "photo_url": None,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        res = client.table("counselors").insert(payload).execute()
        if not res.data:
            raise AppException("Failed to create counselor")
        return res.data[0]

    @staticmethod
    def update_counselor(counselor_id: str, data: dict) -> dict:
        """Update existing counselor."""
        CounselorService.get_counselor_by_id(counselor_id)
        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        update_payload: Dict[str, Any] = {"updated_at": now_iso}

        for key in ["name", "age", "description", "whatsapp_number", "status"]:
            if key in data and data[key] is not None:
                update_payload[key] = data[key]

        res = client.table("counselors").update(update_payload).eq("id", counselor_id).execute()
        return res.data[0]

    @staticmethod
    def delete_counselor(counselor_id: str) -> bool:
        """Delete counselor and photo from storage."""
        counselor = CounselorService.get_counselor_by_id(counselor_id)
        client = get_supabase_admin_client()

        client.table("counselors").delete().eq("id", counselor_id).execute()

        if counselor.get("photo_url"):
            StorageService.delete_file(counselor["photo_url"])

        return True

    @staticmethod
    def upload_photo(counselor_id: str, file) -> dict:
        """Upload photo for counselor."""
        counselor = CounselorService.get_counselor_by_id(counselor_id)

        new_storage_path = StorageService.upload_image(file, "counselors")

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        try:
            res = client.table("counselors").update({
                "photo_url": new_storage_path,
                "updated_at": now_iso
            }).eq("id", counselor_id).execute()

            if counselor.get("photo_url") and counselor["photo_url"] != new_storage_path:
                StorageService.delete_file(counselor["photo_url"])

            return res.data[0]
        except Exception as e:
            StorageService.delete_file(new_storage_path)
            raise AppException(f"Failed to update counselor photo: {str(e)}")

    @staticmethod
    def delete_photo(counselor_id: str) -> dict:
        """Delete photo from counselor."""
        counselor = CounselorService.get_counselor_by_id(counselor_id)
        if counselor.get("photo_url"):
            StorageService.delete_file(counselor["photo_url"])

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        res = client.table("counselors").update({
            "photo_url": None,
            "updated_at": now_iso
        }).eq("id", counselor_id).execute()
        return res.data[0]
