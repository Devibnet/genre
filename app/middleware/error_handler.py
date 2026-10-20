"""Global error handling middleware for Flask application."""

import logging
from flask import Flask, current_app
from werkzeug.exceptions import HTTPException
from app.utils.response import error_response

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, code: str = "BAD_REQUEST", status_code: int = 400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class ValidationException(AppException):
    """Request validation error."""

    def __init__(self, message: str = "Validation failed", details=None):
        super().__init__(message=message, code="VALIDATION_ERROR", status_code=422, details=details)


class UnauthorizedException(AppException):
    """Authentication required / token invalid error."""

    def __init__(self, message: str = "Authentication required", details=None):
        super().__init__(message=message, code="UNAUTHORIZED", status_code=401, details=details)


class ForbiddenException(AppException):
    """Insufficient privileges error."""

    def __init__(self, message: str = "Access denied: Admin role required", details=None):
        super().__init__(message=message, code="FORBIDDEN", status_code=403, details=details)


class NotFoundException(AppException):
    """Resource not found error."""

    def __init__(self, message: str = "Resource not found", details=None):
        super().__init__(message=message, code="NOT_FOUND", status_code=404, details=details)


class ConflictException(AppException):
    """Conflict error (e.g. duplicate slug or unique constraint violation)."""

    def __init__(self, message: str = "Resource conflict", details=None):
        super().__init__(message=message, code="CONFLICT", status_code=409, details=details)


class StorageException(AppException):
    """Storage operation error."""

    def __init__(self, message: str = "Storage operation failed", details=None):
        super().__init__(message=message, code="STORAGE_ERROR", status_code=500, details=details)


class ServiceUnavailableException(AppException):
    """External dependency unavailable."""

    def __init__(self, message: str = "Service temporarily unavailable", details=None):
        super().__init__(message=message, code="SERVICE_UNAVAILABLE", status_code=503, details=details)


def register_error_handlers(app: Flask):
    """Register custom JSON error handlers for Flask app."""

    @app.errorhandler(AppException)
    def handle_app_exception(error: AppException):
        logger.warning("AppException [%s]: %s", error.code, error.message)
        return error_response(
            message=error.message,
            code=error.code,
            details=error.details,
            status_code=error.status_code
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException):
        logger.warning("HTTPException [%s]: %s", error.code, error.description)
        return error_response(
            message=error.description or "HTTP Error",
            code=f"HTTP_{error.code}",
            status_code=error.code or 400
        )

    @app.errorhandler(Exception)
    def handle_generic_exception(error: Exception):
        logger.error("Unhandled Exception: %s", str(error), exc_info=True)
        message = "An internal server error occurred"
        if current_app.debug:
            message = f"Internal Error: {str(error)}"
        return error_response(
            message=message,
            code="INTERNAL_SERVER_ERROR",
            status_code=500
        )
