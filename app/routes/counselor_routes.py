"""Counselor routes (Public and Admin)."""

from flask import Blueprint, request
from app.services.counselor_service import CounselorService
from app.schemas.counselor_schema import (
    CounselorCreateSchema,
    CounselorUpdateSchema,
    format_counselor_dto,
)
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin
from app.middleware.error_handler import ValidationException

counselor_bp = Blueprint("counselors", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@counselor_bp.get("/counselors")
def get_public_counselors():
    """List active counselors for public users."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    counselors, total = CounselorService.get_public_counselors(page=page, per_page=per_page)
    formatted = [format_counselor_dto(c, is_admin=False) for c in counselors]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@counselor_bp.get("/counselors/<counselor_id>")
def get_public_counselor_by_id(counselor_id: str):
    """Get counselor detail by ID."""
    counselor = CounselorService.get_counselor_by_id(counselor_id)
    return success_response(data=format_counselor_dto(counselor, is_admin=False))


# --- ADMIN ENDPOINTS ---

@counselor_bp.get("/admin/counselors")
@require_admin
def get_admin_counselors():
    """List all counselors for admin."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status", type=str)

    counselors, total = CounselorService.get_admin_counselors(page=page, per_page=per_page, status=status)
    formatted = [format_counselor_dto(c, is_admin=True) for c in counselors]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@counselor_bp.get("/admin/counselors/<counselor_id>")
@require_admin
def get_admin_counselor_by_id(counselor_id: str):
    """Get counselor detail by ID for admin."""
    counselor = CounselorService.get_counselor_by_id(counselor_id)
    return success_response(data=format_counselor_dto(counselor, is_admin=True))


@counselor_bp.post("/admin/counselors")
@require_admin
@validate_request(CounselorCreateSchema)
def create_counselor(validated_data: CounselorCreateSchema):
    """Create a new counselor."""
    counselor = CounselorService.create_counselor(validated_data.model_dump())
    return success_response(data=format_counselor_dto(counselor, is_admin=True), message="Counselor created successfully", status_code=201)


@counselor_bp.put("/admin/counselors/<counselor_id>")
@require_admin
@validate_request(CounselorUpdateSchema)
def update_counselor(counselor_id: str, validated_data: CounselorUpdateSchema):
    """Update counselor by ID."""
    counselor = CounselorService.update_counselor(counselor_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_counselor_dto(counselor, is_admin=True), message="Counselor updated successfully")


@counselor_bp.delete("/admin/counselors/<counselor_id>")
@require_admin
def delete_counselor(counselor_id: str):
    """Delete counselor by ID."""
    CounselorService.delete_counselor(counselor_id)
    return success_response(data=None, message="Counselor deleted successfully")


@counselor_bp.post("/admin/counselors/<counselor_id>/photo")
@require_admin
def upload_counselor_photo(counselor_id: str):
    """Upload photo for counselor."""
    if "photo" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'photo' or 'file' form field")

    file = request.files.get("photo") or request.files.get("file")
    counselor = CounselorService.upload_photo(counselor_id, file)
    return success_response(data=format_counselor_dto(counselor, is_admin=True), message="Counselor photo uploaded successfully")


@counselor_bp.delete("/admin/counselors/<counselor_id>/photo")
@require_admin
def delete_counselor_photo(counselor_id: str):
    """Delete counselor photo."""
    counselor = CounselorService.delete_photo(counselor_id)
    return success_response(data=format_counselor_dto(counselor, is_admin=True), message="Counselor photo deleted successfully")
