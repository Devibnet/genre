"""Feedback service for managing Public Masukan & Saran."""

import logging
from typing import Optional, Tuple, List, Dict, Any
from app.extensions.supabase import get_supabase_admin_client, reset_supabase_clients
from app.middleware.error_handler import NotFoundException, AppException

logger = logging.getLogger(__name__)


class FeedbackService:
    """Business logic for Public & Admin Feedback."""

    @staticmethod
    def create_feedback(name: str, message: str) -> dict:
        """Create a new feedback entry via Service Role client."""
        payload = {
            "name": name,
            "message": message
        }

        # Try executing insert with auto-reconnect fallback
        for attempt in range(2):
            try:
                client = get_supabase_admin_client()
                res = client.table("feedback").insert(payload).execute()
                if not res.data or len(res.data) == 0:
                    # In case PostgREST returns empty data without error
                    return {"name": name, "message": message}
                return res.data[0]
            except Exception as e:
                logger.error("Error creating feedback in Supabase (attempt %s): %s", attempt + 1, str(e), exc_info=True)
                if attempt == 0:
                    # Reset cached client in case of stale HTTP connection pool
                    reset_supabase_clients()
                    continue
                raise AppException("Gagal memproses masukan ke database", details=str(e))

    @staticmethod
    def get_admin_feedback(
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Fetch feedback list with pagination and optional search for admin."""
        per_page = min(max(1, per_page), 100)
        page = max(1, page)
        offset = (page - 1) * per_page

        for attempt in range(2):
            try:
                client = get_supabase_admin_client()
                query = client.table("feedback").select("*", count="exact")

                if search:
                    clean_search = search.strip()
                    if clean_search:
                        query = query.or_(f"name.ilike.%{clean_search}%,message.ilike.%{clean_search}%")

                res = (
                    query.order("created_at", desc=True)
                    .range(offset, offset + per_page - 1)
                    .execute()
                )

                total = res.count if res.count is not None else len(res.data or [])
                return res.data or [], total
            except Exception as e:
                logger.error("Error fetching feedback from Supabase (attempt %s): %s", attempt + 1, str(e), exc_info=True)
                if attempt == 0:
                    reset_supabase_clients()
                    continue
                raise AppException("Gagal mengambil data masukan dari database", details=str(e))

    @staticmethod
    def get_feedback_by_id(feedback_id: str) -> dict:
        """Fetch single feedback by UUID."""
        for attempt in range(2):
            try:
                client = get_supabase_admin_client()
                res = client.table("feedback").select("*").eq("id", feedback_id).execute()
                if not res.data or len(res.data) == 0:
                    raise NotFoundException(f"Feedback dengan ID '{feedback_id}' tidak ditemukan")
                return res.data[0]
            except NotFoundException:
                raise
            except Exception as e:
                logger.error("Error fetching feedback by id from Supabase (attempt %s): %s", attempt + 1, str(e), exc_info=True)
                if attempt == 0:
                    reset_supabase_clients()
                    continue
                raise AppException("Gagal mengambil detail feedback", details=str(e))

    @staticmethod
    def delete_feedback(feedback_id: str) -> bool:
        """Delete feedback entry by UUID."""
        FeedbackService.get_feedback_by_id(feedback_id)

        for attempt in range(2):
            try:
                client = get_supabase_admin_client()
                client.table("feedback").delete().eq("id", feedback_id).execute()
                return True
            except Exception as e:
                logger.error("Error deleting feedback from Supabase (attempt %s): %s", attempt + 1, str(e), exc_info=True)
                if attempt == 0:
                    reset_supabase_clients()
                    continue
                raise AppException("Gagal menghapus masukan dari database", details=str(e))
