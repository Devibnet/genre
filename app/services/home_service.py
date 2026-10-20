"""Homepage service compiling aggregated home endpoint data."""

from app.services.settings_service import SettingsService
from app.services.article_service import ArticleService
from app.services.news_service import NewsService
from app.services.gallery_service import GalleryService
from app.services.counselor_service import CounselorService
from app.schemas.settings_schema import format_settings_dto
from app.schemas.article_schema import format_article_dto
from app.schemas.news_schema import format_news_dto
from app.schemas.gallery_schema import format_gallery_dto
from app.schemas.counselor_schema import format_counselor_dto


class HomeService:
    """Aggregates limited data for homepage rendering."""

    @staticmethod
    def get_homepage_data() -> dict:
        """Fetch settings, featured articles, latest news, featured gallery, and active counselors."""
        # 1. Site settings
        raw_settings = SettingsService.get_settings()
        formatted_settings = format_settings_dto(raw_settings)

        # 2. Featured articles (max 6)
        articles_raw, _ = ArticleService.get_public_articles(page=1, per_page=6)
        formatted_articles = [format_article_dto(a, is_admin=False) for a in articles_raw]

        # 3. Latest news (max 6)
        news_raw, _ = NewsService.get_public_news(page=1, per_page=6)
        formatted_news = [format_news_dto(n, photos=[], is_admin=False) for n in news_raw]

        # 4. Featured gallery (max 8)
        gallery_raw, _ = GalleryService.get_gallery_items(page=1, per_page=8)
        formatted_gallery = [format_gallery_dto(g, is_admin=False) for g in gallery_raw]

        # 5. Featured counselors (max 8 active)
        counselors_raw, _ = CounselorService.get_public_counselors(page=1, per_page=8)
        formatted_counselors = [format_counselor_dto(c, is_admin=False) for c in counselors_raw]

        return {
            "settings": formatted_settings,
            "featured_articles": formatted_articles,
            "latest_news": formatted_news,
            "featured_gallery": formatted_gallery,
            "featured_counselors": formatted_counselors
        }
