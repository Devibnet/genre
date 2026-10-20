"""Pydantic schemas for Gallery resource."""

from typing import Optional
from pydantic import BaseModel, Field
from app.utils.storage import build_public_url


class GalleryUpdateSchema(BaseModel):
    caption: str = Field(..., min_length=1)


def format_gallery_dto(item: dict, is_admin: bool = False) -> dict:
    """Format gallery item row."""
    dto = {
        "id": str(item.get("id")),
        "image_url": build_public_url(item.get("image_url")),
        "caption": item.get("caption"),
        "created_at": item.get("created_at"),
    }
    if is_admin:
        dto["created_by"] = item.get("created_by")
    return dto
