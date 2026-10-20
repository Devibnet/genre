"""Supabase client extension module."""

import logging
from typing import Optional

from supabase import Client, create_client
from supabase.client import ClientOptions

from app.config.settings import get_config

logger = logging.getLogger(__name__)

_supabase_anon_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None
_supabase_auth_client: Optional[Client] = None


class SupabaseConfigError(RuntimeError):
    """Raised when required Supabase environment variables are missing."""


def _validate_supabase_config(*, require_service_role: bool = False) -> tuple[str, str, str]:
    """Validate Supabase env vars and return (url, anon_key, service_role_key)."""
    cfg = get_config()
    url = (cfg.SUPABASE_URL or "").strip()
    anon_key = (cfg.SUPABASE_ANON_KEY or "").strip()
    service_key = (cfg.SUPABASE_SERVICE_ROLE_KEY or "").strip()

    missing = []
    if not url:
        missing.append("SUPABASE_URL")
    if not anon_key:
        missing.append("SUPABASE_ANON_KEY")
    if require_service_role and not service_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")

    if missing:
        raise SupabaseConfigError(
            f"Variabel environment Supabase belum dikonfigurasi: {', '.join(missing)}"
        )

    return url, anon_key, service_key


def get_supabase_client() -> Client:
    """Get or initialize public/anon Supabase client."""
    global _supabase_anon_client
    if _supabase_anon_client is None:
        url, anon_key, _ = _validate_supabase_config()
        opts = ClientOptions(auto_refresh_token=False, persist_session=False)
        _supabase_anon_client = create_client(url, anon_key, options=opts)
        logger.info("Supabase anon client initialized")
    return _supabase_anon_client


def get_supabase_auth_client() -> Client:
    """Get or initialize dedicated client for Auth operations to prevent session pollution on admin client."""
    global _supabase_auth_client
    if _supabase_auth_client is None:
        url, anon_key, _ = _validate_supabase_config()
        opts = ClientOptions(auto_refresh_token=False, persist_session=False)
        _supabase_auth_client = create_client(url, anon_key, options=opts)
        logger.info("Supabase auth client initialized")
    return _supabase_auth_client


def get_supabase_admin_client() -> Client:
    """Get or initialize server-side service-role Supabase client.
    
    Uses auto_refresh_token=False and persist_session=False to ensure
    the service role key header is NEVER replaced by user session tokens.
    """
    global _supabase_admin_client

    if _supabase_admin_client is None:
        url, _, service_key = _validate_supabase_config(
            require_service_role=True
        )

        opts = ClientOptions(auto_refresh_token=False, persist_session=False)
        _supabase_admin_client = create_client(url, service_key, options=opts)

        logger.info("Supabase admin client initialized with SERVICE ROLE KEY")

    return _supabase_admin_client


def verify_supabase_connection() -> dict:
    """Ping Supabase and verify the feedback table is reachable."""
    client = get_supabase_admin_client()
    res = client.table("feedback").select("id", count="exact").limit(1).execute()
    total = res.count if res.count is not None else len(res.data or [])
    return {"connected": True, "feedback_table": True, "feedback_count": total}


def reset_supabase_clients():
    """Reset cached client singletons (useful for testing or reconnects)."""
    global _supabase_anon_client, _supabase_admin_client, _supabase_auth_client
    _supabase_anon_client = None
    _supabase_admin_client = None
    _supabase_auth_client = None
