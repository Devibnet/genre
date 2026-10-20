"""Pydantic schemas for Article resource."""

from typing import Optional
from pydantic import BaseModel, Field
from app.utils.storage import build_public_url


class ArticleCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    drive_url: str = Field(..., min_length=1)
    status: str = Field(default="draft", pattern="^(draft|published)$")
    slug: Optional[str] = Field(default=None, max_length=255)
    cover_url: Optional[str] = None


class ArticleUpdateSchema(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    drive_url: Optional[str] = Field(default=None, min_length=1)
    status: Optional[str] = Field(default=None, pattern="^(draft|published)$")
    slug: Optional[str] = Field(default=None, max_length=255)
    cover_url: Optional[str] = None


def format_article_dto(article: dict, is_admin: bool = False) -> dict:
    """Format article database row into clean DTO with formatted public cover URL."""
    dto = {
        "id": str(article.get("id")),
        "title": article.get("title"),
        "slug": article.get("slug"),
        "description": article.get("description"),
        "cover_url": build_public_url(article.get("cover_url")),
        "drive_url": article.get("drive_url"),
        "status": article.get("status"),
        "published_at": article.get("published_at"),
        "created_at": article.get("created_at"),
    }
    if is_admin:
        dto["created_by"] = article.get("created_by")
        dto["updated_at"] = article.get("updated_at")
    return dto
