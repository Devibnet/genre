"""Feedback routes for Public and Admin."""

from flask import Blueprint, request
from app.services.feedback_service import FeedbackService
from app.schemas.feedback_schema import (
    FeedbackCreateSchema,
    format_feedback_dto,
)
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@feedback_bp.post("/feedback")
@validate_request(FeedbackCreateSchema)
def submit_public_feedback(validated_data: FeedbackCreateSchema):
    """Public endpoint to submit feedback/suggestions."""
    feedback = FeedbackService.create_feedback(
        name=validated_data.name,
        message=validated_data.message,
    )
    return success_response(
        data=format_feedback_dto(feedback),
        message="Feedback berhasil dikirim.",
        status_code=201,
    )


# --- ADMIN ENDPOINTS ---

@feedback_bp.get("/admin/feedback")
@require_admin
def get_admin_feedback():
    """List feedback with pagination and search for admin."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)

    feedbacks, total = FeedbackService.get_admin_feedback(
        page=page,
        per_page=per_page,
        search=search,
    )
    formatted = [format_feedback_dto(f) for f in feedbacks]

    return list_response(
        data=formatted,
        page=page,
        per_page=per_page,
        total=total,
        message="Data feedback berhasil diambil",
    )


@feedback_bp.get("/admin/feedback/<feedback_id>")
@require_admin
def get_admin_feedback_by_id(feedback_id: str):
    """Get single feedback detail by ID for admin."""
    feedback = FeedbackService.get_feedback_by_id(feedback_id)
    return success_response(
        data=format_feedback_dto(feedback),
        message="Detail feedback berhasil diambil",
    )


@feedback_bp.delete("/admin/feedback/<feedback_id>")
@require_admin
def delete_admin_feedback(feedback_id: str):
    """Delete feedback entry by ID."""
    FeedbackService.delete_feedback(feedback_id)
    return success_response(
        data=None,
        message="Feedback berhasil dihapus",
    )
