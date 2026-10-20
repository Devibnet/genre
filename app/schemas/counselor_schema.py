"""Pydantic schemas for Counselor resource."""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re
from app.utils.storage import build_public_url


class CounselorCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    age: int = Field(..., gt=0, lt=150)
    description: Optional[str] = None
    whatsapp_number: str = Field(..., min_length=5, max_length=20)
    status: str = Field(default="active", pattern="^(active|inactive)$")

    @field_validator("whatsapp_number")
    @classmethod
    def validate_whatsapp(cls, v: str) -> str:
        clean_num = re.sub(r"[\s\-\+\(\)]", "", v)
        if not clean_num.isdigit():
            raise ValueError("WhatsApp number must contain digits only")
        return clean_num


class CounselorUpdateSchema(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    age: Optional[int] = Field(default=None, gt=0, lt=150)
    description: Optional[str] = None
    whatsapp_number: Optional[str] = Field(default=None, min_length=5, max_length=20)
    status: Optional[str] = Field(default=None, pattern="^(active|inactive)$")

    @field_validator("whatsapp_number")
    @classmethod
    def validate_whatsapp(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        clean_num = re.sub(r"[\s\-\+\(\)]", "", v)
        if not clean_num.isdigit():
            raise ValueError("WhatsApp number must contain digits only")
        return clean_num


def format_counselor_dto(counselor: dict, is_admin: bool = False) -> dict:
    """Format counselor row."""
    dto = {
        "id": str(counselor.get("id")),
        "name": counselor.get("name"),
        "age": counselor.get("age"),
        "photo_url": build_public_url(counselor.get("photo_url")),
        "description": counselor.get("description"),
        "whatsapp_number": counselor.get("whatsapp_number"),
        "status": counselor.get("status"),
        "created_at": counselor.get("created_at"),
    }
    if is_admin:
        dto["updated_at"] = counselor.get("updated_at")
    return dto
