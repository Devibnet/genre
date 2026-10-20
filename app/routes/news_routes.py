"""Program News routes (Public and Admin)."""

from flask import Blueprint, request, g
from app.services.news_service import NewsService
from app.schemas.news_schema import (
    NewsCreateSchema,
    NewsUpdateSchema,
    NewsPhotoUpdateSchema,
    format_news_dto,
    format_news_photo_dto,
)
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin
from app.middleware.error_handler import ValidationException

news_bp = Blueprint("news", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@news_bp.get("/news")
def get_public_news():
    """List published program news."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)

    news_list, total = NewsService.get_public_news(page=page, per_page=per_page, search=search)
    formatted = [format_news_dto(n, photos=[], is_admin=False) for n in news_list]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@news_bp.get("/news/<slug>")
def get_public_news_by_slug(slug: str):
    """Get published news detail by slug with photo documentation."""
    news, photos = NewsService.get_public_news_by_slug(slug)
    return success_response(data=format_news_dto(news, photos=photos, is_admin=False))


# --- ADMIN ENDPOINTS ---

@news_bp.get("/admin/news")
@require_admin
def get_admin_news():
    """List all program news for admin."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)
    status = request.args.get("status", type=str)

    news_list, total = NewsService.get_admin_news(page=page, per_page=per_page, search=search, status=status)
    formatted = [format_news_dto(n, photos=[], is_admin=True) for n in news_list]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@news_bp.get("/admin/news/<news_id>")
@require_admin
def get_admin_news_by_id(news_id: str):
    """Get program news detail by ID for admin."""
    news, photos = NewsService.get_news_by_id(news_id)
    return success_response(data=format_news_dto(news, photos=photos, is_admin=True))


@news_bp.post("/admin/news")
@require_admin
@validate_request(NewsCreateSchema)
def create_news(validated_data: NewsCreateSchema):
    """Create program news."""
    profile_id = g.profile["id"]
    news = NewsService.create_news(validated_data.model_dump(), profile_id=profile_id)
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="News created successfully", status_code=201)


@news_bp.put("/admin/news/<news_id>")
@require_admin
@validate_request(NewsUpdateSchema)
def update_news(news_id: str, validated_data: NewsUpdateSchema):
    """Update program news."""
    news = NewsService.update_news(news_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="News updated successfully")


@news_bp.delete("/admin/news/<news_id>")
@require_admin
def delete_news(news_id: str):
    """Delete program news and all documentation photos."""
    NewsService.delete_news(news_id)
    return success_response(data=None, message="News deleted successfully")


@news_bp.post("/admin/news/<news_id>/publish")
@require_admin
def publish_news(news_id: str):
    """Publish program news."""
    news = NewsService.publish_news(news_id)
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="News published successfully")


@news_bp.post("/admin/news/<news_id>/unpublish")
@require_admin
def unpublish_news(news_id: str):
    """Unpublish program news."""
    news = NewsService.unpublish_news(news_id)
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="News unpublished successfully")


@news_bp.post("/admin/news/<news_id>/cover")
@require_admin
def upload_news_cover(news_id: str):
    """Upload cover photo for news."""
    if "cover" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'cover' or 'file' form field")

    file = request.files.get("cover") or request.files.get("file")
    news = NewsService.upload_cover(news_id, file)
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="Cover image uploaded successfully")


@news_bp.delete("/admin/news/<news_id>/cover")
@require_admin
def delete_news_cover(news_id: str):
    """Delete news cover photo."""
    news = NewsService.delete_cover(news_id)
    return success_response(data=format_news_dto(news, photos=[], is_admin=True), message="Cover image deleted successfully")


# --- NEWS PHOTOS ADMIN ENDPOINTS ---

@news_bp.post("/admin/news/<news_id>/photos")
@require_admin
def add_news_photo(news_id: str):
    """Upload documentation photo for program news (multipart/form-data)."""
    if "image" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'image' or 'file' form field")

    file = request.files.get("image") or request.files.get("file")
    caption = request.form.get("caption")
    order_number = request.form.get("order_number", 1, type=int)

    photo = NewsService.add_news_photo(news_id, file, caption=caption, order_number=order_number)
    return success_response(data=format_news_photo_dto(photo), message="News photo added successfully", status_code=201)


@news_bp.put("/admin/news-photos/<photo_id>")
@require_admin
@validate_request(NewsPhotoUpdateSchema)
def update_news_photo(photo_id: str, validated_data: NewsPhotoUpdateSchema):
    """Update photo caption or order number."""
    photo = NewsService.update_news_photo(photo_id, caption=validated_data.caption, order_number=validated_data.order_number)
    return success_response(data=format_news_photo_dto(photo), message="News photo updated successfully")


@news_bp.delete("/admin/news-photos/<photo_id>")
@require_admin
def delete_news_photo(photo_id: str):
    """Delete news photo."""
    NewsService.delete_news_photo(photo_id)
    return success_response(data=None, message="News photo deleted successfully")
