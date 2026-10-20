"""Authentication routes."""

from flask import Blueprint, request, g
from app.extensions.supabase import get_supabase_admin_client, get_supabase_auth_client
from app.utils.response import success_response, error_response
from app.middleware.auth import require_auth, require_admin
from app.middleware.error_handler import UnauthorizedException, ForbiddenException

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@auth_bp.post("/login")
def admin_login():
    """Authenticate admin user via Supabase Auth and return Bearer token."""
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response(message="Email and password are required", code="VALIDATION_ERROR", status_code=400)

    # Use isolated auth client for sign in so admin client is never mutated
    auth_client = get_supabase_auth_client()

    try:
        auth_res = auth_client.auth.sign_in_with_password({"email": email, "password": password})
        if not auth_res or not auth_res.session:
            raise UnauthorizedException("Invalid credentials")

        user_id = auth_res.user.id
        access_token = auth_res.session.access_token

        # Check admin role profile with admin client (Service Role Key)
        admin_client = get_supabase_admin_client()
        prof_res = admin_client.table("profiles").select("*").eq("user_id", user_id).execute()
        if not prof_res.data or len(prof_res.data) == 0:
            raise ForbiddenException("User profile not found")

        profile = prof_res.data[0]
        if profile.get("role") != "admin":
            raise ForbiddenException("Access denied: User is not an admin")

        return success_response(
            data={
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": auth_res.session.expires_in,
                "user": {
                    "id": user_id,
                    "email": auth_res.user.email
                },
                "profile": profile
            },
            message="Login successful"
        )
    except UnauthorizedException as e:
        return error_response(message=e.message, code="UNAUTHORIZED", status_code=401)
    except ForbiddenException as e:
        return error_response(message=e.message, code="FORBIDDEN", status_code=403)
    except Exception as e:
        return error_response(message="Authentication failed", code="AUTH_FAILED", details=str(e), status_code=400)


@auth_bp.get("/me")
@require_auth
def get_current_user_profile():
    """Retrieve logged in user and profile details."""
    return success_response(
        data={
            "user": {
                "id": g.user.id,
                "email": getattr(g.user, "email", None)
            },
            "profile": g.profile
        },
        message="Profile retrieved successfully"
    )
