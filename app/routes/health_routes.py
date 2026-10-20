"""Health check routes."""

import logging

from flask import Blueprint

from app.extensions.supabase import SupabaseConfigError, verify_supabase_connection
from app.utils.response import success_response

logger = logging.getLogger(__name__)

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
@health_bp.get("/api/health")
@health_bp.get("/api/v1/health")
def health_check():
    """Health check endpoint."""
    return success_response(
        data={"status": "ok", "service": "websitegenbul-api"},
        message="Backend is running",
    )


@health_bp.get("/health/db")
@health_bp.get("/api/health/db")
@health_bp.get("/api/v1/health/db")
def health_db_check():
    """Database connectivity check endpoint."""
    try:
        info = verify_supabase_connection()
        return success_response(
            data={"status": "connected", "database": "supabase_postgresql", **info},
            message="Database connection healthy",
        )
    except SupabaseConfigError as exc:
        logger.error("Supabase config error: %s", exc)
        return success_response(
            data={"status": "misconfigured", "error": str(exc)},
            message="Database belum dikonfigurasi dengan benar",
            status_code=503,
        )
    except Exception as exc:
        logger.error("Database health check failed: %s", exc, exc_info=True)
        return success_response(
            data={"status": "degraded", "error": str(exc)},
            message="Database connectivity check encountered an issue",
            status_code=503,
        )
