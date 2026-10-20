"""Pydantic schemas for Site Settings resource."""

from typing import Optional
from pydantic import BaseModel, Field
from app.utils.storage import build_public_url


class SettingsUpdateSchema(BaseModel):
    site_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=30)
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    maps_url: Optional[str] = None
    logo_url: Optional[str] = None


def format_settings_dto(settings: dict) -> dict:
    """Format single record site settings row."""
    if not settings:
        return {}
    return {
        "id": str(settings.get("id")) if settings.get("id") else None,
        "site_name": settings.get("site_name"),
        "description": settings.get("description"),
        "address": settings.get("address"),
        "email": settings.get("email"),
        "phone": settings.get("phone"),
        "instagram_url": settings.get("instagram_url"),
        "facebook_url": settings.get("facebook_url"),
        "tiktok_url": settings.get("tiktok_url"),
        "maps_url": settings.get("maps_url"),
        "logo_url": build_public_url(settings.get("logo_url")),
        "updated_at": settings.get("updated_at"),
    }
