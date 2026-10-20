"""Pydantic schemas for Program News and News Photos."""

from typing import Optional, List
from pydantic import BaseModel, Field
from app.utils.storage import build_public_url


class NewsCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    event_date: str = Field(..., min_length=1)
    status: str = Field(default="draft", pattern="^(draft|published)$")
    slug: Optional[str] = Field(default=None, max_length=255)
    cover_url: Optional[str] = None


class NewsUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    event_date: Optional[str] = Field(default=None, min_length=1)
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    slug: Optional[str] = Field(default=None, max_length=255)
    cover_url: Optional[str] = None


class NewsPhotoUpdateSchema(BaseModel):
    caption: Optional[str] = None
    order_number: Optional[int] = Field(default=None, gt=0)


def format_news_photo_dto(photo: dict) -> dict:
    """Format single news photo row."""
    return {
        "id": str(photo.get("id")),
        "news_id": str(photo.get("news_id")),
        "image_url": build_public_url(photo.get("image_url")),
        "caption": photo.get("caption"),
        "order_number": photo.get("order_number"),
        "created_at": photo.get("created_at"),
    }


def format_news_dto(news: dict, photos: Optional[List[dict]] = None, is_admin: bool = False) -> dict:
    """Format news row with optional photos list."""
    formatted_photos = [format_news_photo_dto(p) for p in (photos or [])]
    formatted_photos.sort(key=lambda x: x.get("order_number") or 0)

    dto = {
        "id": str(news.get("id")),
        "title": news.get("title"),
        "slug": news.get("slug"),
        "description": news.get("description"),
        "event_date": str(news.get("event_date")),
        "cover_url": build_public_url(news.get("cover_url")),
        "status": news.get("status"),
        "published_at": news.get("published_at"),
        "created_at": news.get("created_at"),
        "photos": formatted_photos,
    }
    if is_admin:
        dto["created_by"] = news.get("created_by")
        dto["updated_at"] = news.get("updated_at")
    return dto
