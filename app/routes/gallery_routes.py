"""Gallery routes (Public and Admin)."""

from flask import Blueprint, request, g
from app.services.gallery_service import GalleryService
from app.schemas.gallery_schema import GalleryUpdateSchema, format_gallery_dto
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin
from app.middleware.error_handler import ValidationException

gallery_bp = Blueprint("gallery", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@gallery_bp.get("/gallery")
def get_public_gallery():
    """List gallery photos."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    items, total = GalleryService.get_gallery_items(page=page, per_page=per_page)
    formatted = [format_gallery_dto(item, is_admin=False) for item in items]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@gallery_bp.get("/gallery/<gallery_id>")
def get_public_gallery_by_id(gallery_id: str):
    """Get gallery item by ID."""
    item = GalleryService.get_gallery_by_id(gallery_id)
    return success_response(data=format_gallery_dto(item, is_admin=False))


# --- ADMIN ENDPOINTS ---

@gallery_bp.get("/admin/gallery")
@require_admin
def get_admin_gallery():
    """List gallery photos for admin."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    items, total = GalleryService.get_gallery_items(page=page, per_page=per_page)
    formatted = [format_gallery_dto(item, is_admin=True) for item in items]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@gallery_bp.post("/admin/gallery")
@require_admin
def create_gallery_item():
    """Upload photo and create gallery item (multipart/form-data: image file, caption text)."""
    if "image" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'image' or 'file' form field")

    file = request.files.get("image") or request.files.get("file")
    caption = request.form.get("caption", "").strip()

    if not caption:
        raise ValidationException("Caption is required for gallery upload")

    profile_id = g.profile["id"]
    item = GalleryService.create_gallery_item(file, caption=caption, profile_id=profile_id)
    return success_response(data=format_gallery_dto(item, is_admin=True), message="Gallery item created successfully", status_code=201)


@gallery_bp.put("/admin/gallery/<gallery_id>")
@require_admin
@validate_request(GalleryUpdateSchema)
def update_gallery_item(gallery_id: str, validated_data: GalleryUpdateSchema):
    """Update gallery item caption."""
    item = GalleryService.update_gallery_item(gallery_id, caption=validated_data.caption)
    return success_response(data=format_gallery_dto(item, is_admin=True), message="Gallery item caption updated successfully")


@gallery_bp.delete("/admin/gallery/<gallery_id>")
@require_admin
def delete_gallery_item(gallery_id: str):
    """Delete gallery item and remove image file from storage."""
    GalleryService.delete_gallery_item(gallery_id)
    return success_response(data=None, message="Gallery item deleted successfully")
