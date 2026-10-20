"""Pydantic schemas for Feedback resource."""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class FeedbackCreateSchema(BaseModel):
    """Schema for creating a new feedback from public users."""

    name: str = Field(..., min_length=1, max_length=100, description="Nama pengirim masukan")
    message: str = Field(..., min_length=1, max_length=5000, description="Isi masukan atau saran")

    @field_validator("name", "message")
    @classmethod
    def strip_whitespace_and_validate(cls, value: str) -> str:
        trimmed = value.strip() if isinstance(value, str) else ""
        if not trimmed:
            raise ValueError("Field tidak boleh kosong atau hanya berisi spasi")
        return trimmed


def format_feedback_dto(feedback: dict) -> dict:
    """Format feedback database row into clean DTO."""
    return {
        "id": str(feedback.get("id")),
        "name": feedback.get("name"),
        "message": feedback.get("message"),
        "created_at": feedback.get("created_at"),
    }
