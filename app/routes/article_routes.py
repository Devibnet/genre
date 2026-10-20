"""Articles routes (Public and Admin)."""

from flask import Blueprint, request, g
from app.services.article_service import ArticleService
from app.schemas.article_schema import (
    ArticleCreateSchema,
    ArticleUpdateSchema,
    format_article_dto,
)
from app.utils.validation import validate_request
from app.utils.response import success_response, list_response
from app.middleware.auth import require_admin
from app.middleware.error_handler import ValidationException

article_bp = Blueprint("articles", __name__, url_prefix="/api/v1")


# --- PUBLIC ENDPOINTS ---

@article_bp.get("/articles")
def get_public_articles():
    """List published articles for public website."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)

    articles, total = ArticleService.get_public_articles(page=page, per_page=per_page, search=search)
    formatted = [format_article_dto(a, is_admin=False) for a in articles]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@article_bp.get("/articles/<slug>")
def get_public_article_by_slug(slug: str):
    """Get published article by slug."""
    article = ArticleService.get_public_article_by_slug(slug)
    return success_response(data=format_article_dto(article, is_admin=False))


# --- ADMIN ENDPOINTS ---

@article_bp.get("/admin/articles")
@require_admin
def get_admin_articles():
    """List all articles for admin management."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", type=str)
    status = request.args.get("status", type=str)

    articles, total = ArticleService.get_admin_articles(page=page, per_page=per_page, search=search, status=status)
    formatted = [format_article_dto(a, is_admin=True) for a in articles]

    return list_response(data=formatted, page=page, per_page=per_page, total=total)


@article_bp.get("/admin/articles/<article_id>")
@require_admin
def get_admin_article_by_id(article_id: str):
    """Get article detail by ID for admin."""
    article = ArticleService.get_article_by_id(article_id)
    return success_response(data=format_article_dto(article, is_admin=True))


@article_bp.post("/admin/articles")
@require_admin
@validate_request(ArticleCreateSchema)
def create_article(validated_data: ArticleCreateSchema):
    """Create a new article."""
    profile_id = g.profile["id"]
    article = ArticleService.create_article(validated_data.model_dump(), profile_id=profile_id)
    return success_response(data=format_article_dto(article, is_admin=True), message="Article created successfully", status_code=201)


@article_bp.put("/admin/articles/<article_id>")
@require_admin
@validate_request(ArticleUpdateSchema)
def update_article(article_id: str, validated_data: ArticleUpdateSchema):
    """Update article by ID."""
    article = ArticleService.update_article(article_id, validated_data.model_dump(exclude_unset=True))
    return success_response(data=format_article_dto(article, is_admin=True), message="Article updated successfully")


@article_bp.delete("/admin/articles/<article_id>")
@require_admin
def delete_article(article_id: str):
    """Delete article by ID."""
    ArticleService.delete_article(article_id)
    return success_response(data=None, message="Article deleted successfully")


@article_bp.post("/admin/articles/<article_id>/publish")
@require_admin
def publish_article(article_id: str):
    """Publish article."""
    article = ArticleService.publish_article(article_id)
    return success_response(data=format_article_dto(article, is_admin=True), message="Article published successfully")


@article_bp.post("/admin/articles/<article_id>/unpublish")
@require_admin
def unpublish_article(article_id: str):
    """Unpublish article."""
    article = ArticleService.unpublish_article(article_id)
    return success_response(data=format_article_dto(article, is_admin=True), message="Article unpublished successfully")


@article_bp.post("/admin/articles/<article_id>/cover")
@require_admin
def upload_article_cover(article_id: str):
    """Upload cover image for article (multipart/form-data)."""
    if "cover" not in request.files and "file" not in request.files:
        raise ValidationException("File payload missing. Please provide 'cover' or 'file' form field")

    file = request.files.get("cover") or request.files.get("file")
    article = ArticleService.upload_cover(article_id, file)
    return success_response(data=format_article_dto(article, is_admin=True), message="Cover image uploaded successfully")


@article_bp.delete("/admin/articles/<article_id>/cover")
@require_admin
def delete_article_cover(article_id: str):
    """Delete article cover image."""
    article = ArticleService.delete_cover(article_id)
    return success_response(data=format_article_dto(article, is_admin=True), message="Cover image deleted successfully")
