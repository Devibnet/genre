"""Standard response formatter module."""

from typing import Any, Optional, Dict, Tuple
from flask import jsonify, Response


def success_response(
    data: Any = None,
    message: str = "Operation successful",
    status_code: int = 200
) -> Tuple[Response, int]:
    """Generate a standard success JSON response."""
    payload = {
        "success": True,
        "message": message,
        "data": data
    }
    return jsonify(payload), status_code


def list_response(
    data: list,
    page: int = 1,
    per_page: int = 10,
    total: int = 0,
    message: str = "Data successfully retrieved",
    status_code: int = 200
) -> Tuple[Response, int]:
    """Generate a standard paginated list JSON response."""
    total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0
    payload = {
        "success": True,
        "message": message,
        "data": data,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages
        }
    }
    return jsonify(payload), status_code


def error_response(
    message: str = "An error occurred",
    code: str = "INTERNAL_ERROR",
    details: Optional[Any] = None,
    status_code: int = 400
) -> Tuple[Response, int]:
    """Generate a standard error JSON response."""
    error_payload: Dict[str, Any] = {"code": code}
    if details is not None:
        error_payload["details"] = details

    payload = {
        "success": False,
        "message": message,
        "error": error_payload
    }
    return jsonify(payload), status_code
