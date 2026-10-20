"""Authentication and authorization middleware."""

import logging
from functools import wraps
from flask import request, g
from app.extensions.supabase import get_supabase_admin_client, get_supabase_auth_client
from app.middleware.error_handler import UnauthorizedException, ForbiddenException

logger = logging.getLogger(__name__)


def extract_bearer_token() -> str:
    """Extract Bearer token from request Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header:
        raise UnauthorizedException("Authorization header missing")

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("Invalid Authorization header format. Expected 'Bearer <token>'")

    return parts[1]


def verify_supabase_token(token: str):
    """Verify Supabase JWT token and fetch associated profile."""
    # Use dedicated auth client for token verification so admin client session is never polluted
    auth_client = get_supabase_auth_client()

    try:
        # Get user from Supabase Auth API using token
        user_response = auth_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise UnauthorizedException("Invalid or expired session token")

        user_data = user_response.user
        user_id = user_data.id

        # Query profile using admin client with Service Role Key
        admin_client = get_supabase_admin_client()
        profile_res = admin_client.table("profiles").select("*").eq("user_id", user_id).execute()

        if not profile_res.data or len(profile_res.data) == 0:
            raise UnauthorizedException("User profile not found")

        profile = profile_res.data[0]

        return user_data, profile

    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error("Token verification failed: %s", str(e))
        raise UnauthorizedException("Failed to verify token", details=str(e))


def require_auth(f):
    """Decorator to require valid authentication."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_bearer_token()
        user, profile = verify_supabase_token(token)
        g.user = user
        g.profile = profile
        return f(*args, **kwargs)

    return decorated


def require_admin(f):
    """Decorator to require admin role."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_bearer_token()
        user, profile = verify_supabase_token(token)
        # Ensure the profile belongs to the authenticated user and has admin role
        if profile.get("role") != "admin" or profile.get("user_id") != getattr(user, "id", None):
            raise ForbiddenException("Admin privileges required for this action")
        g.user = user
        g.profile = profile
        return f(*args, **kwargs)

    return decorated
