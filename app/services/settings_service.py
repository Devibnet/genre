"""Site settings service for managing single-record website metadata."""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.extensions.supabase import get_supabase_admin_client
from app.services.storage_service import StorageService
from app.middleware.error_handler import AppException


class SettingsService:
    """Business logic for single-record Site Settings."""

    @staticmethod
    def get_settings() -> dict:
        """Fetch site settings single record. Initializes default record if empty."""
        client = get_supabase_admin_client()
        res = client.table("site_settings").select("*").execute()

        if res.data and len(res.data) > 0:
            return res.data[0]

        # Initialize default row if database table is empty
        now_iso = datetime.now(timezone.utc).isoformat()
        default_payload = {
            "site_name": "Forum GenRe Kabupaten Buleleng",
            "description": "Pusat Informasi, Edukasi, dan Konseling Sebaya Remaja Kabupaten Buleleng.",
            "updated_at": now_iso
        }
        init_res = client.table("site_settings").insert(default_payload).execute()
        return init_res.data[0] if init_res.data else default_payload

    @staticmethod
    def update_settings(data: dict) -> dict:
        """Update single site_settings record."""
        current = SettingsService.get_settings()
        setting_id = current.get("id")

        client = get_supabase_admin_client()
        now_iso = datetime.now(timezone.utc).isoformat()

        update_payload: Dict[str, Any] = {"updated_at": now_iso}

        for key in [
            "site_name", "description", "address", "email", "phone",
            "instagram_url", "facebook_url", "tiktok_url", "maps_url", "logo_url"
        ]:
            if key in data and data[key] is not None:
                update_payload[key] = data[key]

        if setting_id:
            res = client.table("site_settings").update(update_payload).eq("id", setting_id).execute()
            return res.data[0] if res.data else current
        else:
            # If no ID was present, insert payload
            res = client.table("site_settings").insert(update_payload).execute()
            return res.data[0]

    @staticmethod
    def upload_logo(file) -> dict:
        """Upload website logo into site/logo storage directory."""
        current = SettingsService.get_settings()

        new_storage_path = StorageService.upload_image(file, "site/logo")

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()

        try:
            if current.get("id"):
                res = client.table("site_settings").update({
                    "logo_url": new_storage_path,
                    "updated_at": now_iso
                }).eq("id", current["id"]).execute()
                data = res.data[0]
            else:
                res = client.table("site_settings").insert({
                    "site_name": "Forum GenRe Kabupaten Buleleng",
                    "logo_url": new_storage_path,
                    "updated_at": now_iso
                }).execute()
                data = res.data[0]

            if current.get("logo_url") and current["logo_url"] != new_storage_path:
                StorageService.delete_file(current["logo_url"])

            return data
        except Exception as e:
            StorageService.delete_file(new_storage_path)
            raise AppException(f"Failed to update site logo: {str(e)}")

    @staticmethod
    def delete_logo() -> dict:
        """Delete website logo."""
        current = SettingsService.get_settings()
        if current.get("logo_url"):
            StorageService.delete_file(current["logo_url"])

        now_iso = datetime.now(timezone.utc).isoformat()
        client = get_supabase_admin_client()
        if current.get("id"):
            res = client.table("site_settings").update({
                "logo_url": None,
                "updated_at": now_iso
            }).eq("id", current["id"]).execute()
            return res.data[0]
        return current
