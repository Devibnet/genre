"""Site settings routes (Public and Admin)."""

from flask import Blueprint, request
from app.services.settings_service import SettingsService
from app.schemas.settings_schema import SettingsUpdateSchema, format_settings_dto
from app.utils.validation import validate_request
from app.utils.response import success_response
from app.middleware.auth import require_admin
from app.middleware.error_handler import ValidationException

settings_bp = Blueprint("settings", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINT ---

@settings_bp.get("/settings")
def get_public_settings():
    """Get site settings and contact info."""
    settings = SettingsService.get_settings()
    return success_response(data=format_settings_dto(settings))


# --- ADMIN ENDPOINTS ---

@settings_bp.get("/admin/settings")
@require_admin
def get_admin_settings():
    """Get site settings for admin."""
    settings = SettingsService.get_settings()
    return success_response(data=format_settings_dto(settings))


@settings_bp.put("/admin/settings")
@require_admin
@validate_request(SettingsUpdateSchema)
def update_settings(validated_data: SettingsUpdateSchema):
    """Update single record site settings."""
    settings = SettingsService.update_settings(validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_settings_dto(settings), message="Site settings updated successfully")


@settings_bp.post("/admin/settings/logo")
@require_admin
def upload_site_logo():
    """Upload site logo image."""
    if "logo" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'logo' or 'file' form field")

    file = request.files.get("logo") or request.files.get("file")
    settings = SettingsService.upload_logo(file)
    return success_response(data=format_settings_dto(settings), message="Site logo uploaded successfully")


@settings_bp.delete("/admin/settings/logo")
@require_admin
def delete_site_logo():
    """Delete site logo image."""
    settings = SettingsService.delete_logo()
    return success_response(data=format_settings_dto(settings), message="Site logo deleted successfully")
