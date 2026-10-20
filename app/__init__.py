"""Flask Application Factory module for Forum GenRe Kabupaten Buleleng REST API."""

import logging
from flask import Flask
from flask_cors import CORS

from app.config.settings import get_config
from app.middleware.error_handler import register_error_handlers
from app.routes.health_routes import health_bp
from app.routes.auth_routes import auth_bp
from app.routes.home_routes import home_bp
from app.routes.article_routes import article_bp
from app.routes.quiz_routes import quiz_bp
from app.routes.news_routes import news_bp
from app.routes.gallery_routes import gallery_bp
from app.routes.counselor_routes import counselor_bp
from app.routes.settings_routes import settings_bp
from app.routes.feedback_routes import feedback_bp

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger(__name__)


def create_app(config_class=None) -> Flask:
    """Application Factory for initializing Flask application instance."""
    app = Flask(__name__)

    # Load configuration
    config_obj = config_class() if config_class else get_config()
    app.config.from_object(config_obj)

    # Initialize CORS with dynamic origins from settings
    origins = getattr(config_obj, "cors_origins", ["*"])
    CORS(app, origins=origins, supports_credentials=True)

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(article_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(gallery_bp)
    app.register_blueprint(counselor_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(feedback_bp)

    _log_startup_checks(app)

    return app


def _log_startup_checks(app: Flask):
    """Verify critical dependencies at startup and log actionable warnings."""
    if app.config.get("TESTING"):
        return

    try:
        from app.extensions.supabase import verify_supabase_connection

        info = verify_supabase_connection()
        logger.info(
            "Supabase OK — feedback table reachable (%s rows)",
            info.get("feedback_count", "?"),
        )
    except Exception as exc:
        logger.error(
            "Supabase startup check FAILED: %s — fitur masukan/saran mungkin tidak berfungsi",
            exc,
        )
