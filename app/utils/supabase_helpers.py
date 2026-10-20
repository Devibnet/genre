"""Shared helpers for Supabase / PostgREST operations."""

import logging
from typing import Any

from postgrest.exceptions import APIError

from app.middleware.error_handler import AppException, NotFoundException

logger = logging.getLogger(__name__)

# PostgREST error codes that indicate transient/network issues worth retrying once.
_RETRYABLE_CODES = {"PGRST000", "PGRST001", "PGRST002", "PGRST003"}


def _parse_api_error(error: APIError) -> tuple[str, str, int]:
    """Convert PostgREST APIError into (message, code, status_code)."""
    payload = error.args[0] if error.args else {}
    if not isinstance(payload, dict):
        payload = {}

    pg_code = payload.get("code", "")
    details = payload.get("details") or payload.get("hint") or ""
    raw_message = payload.get("message") or str(error)

    if pg_code == "PGRST205" or "feedback" in raw_message.lower() and "does not exist" in raw_message.lower():
        return (
            "Tabel feedback belum tersedia di database. Hubungi administrator.",
            "DATABASE_SCHEMA_ERROR",
            503,
        )

    if pg_code in {"42501", "PGRST301"} or "permission denied" in raw_message.lower():
        return (
            "Akses database ditolak. Periksa konfigurasi Supabase service role key.",
            "DATABASE_PERMISSION_ERROR",
            503,
        )

    if "invalid api key" in raw_message.lower() or pg_code == "PGRST401":
        return (
            "Koneksi database gagal: API key Supabase tidak valid.",
            "DATABASE_AUTH_ERROR",
            503,
        )

    message = raw_message
    if details and details not in message:
        message = f"{message} ({details})"

    return message, "DATABASE_ERROR", 503


def execute_query(builder, *, operation: str = "query", retry: bool = True) -> Any:
    """
    Execute a Supabase query builder with consistent error handling.

    Args:
        builder: Supabase table query builder (already chained, not yet executed).
        operation: Human-readable operation label for logs.
        retry: Retry once on transient PostgREST/network errors.
    """
    attempts = 2 if retry else 1
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            return builder.execute()
        except APIError as exc:
            last_error = exc
            payload = exc.args[0] if exc.args else {}
            code = payload.get("code", "") if isinstance(payload, dict) else ""
            logger.error(
                "Supabase %s failed (attempt %s/%s) [%s]: %s",
                operation,
                attempt,
                attempts,
                code,
                exc,
            )
            if attempt < attempts and code in _RETRYABLE_CODES:
                continue
            message, err_code, status = _parse_api_error(exc)
            raise AppException(message, code=err_code, status_code=status) from exc
        except Exception as exc:
            last_error = exc
            logger.error("Supabase %s unexpected error: %s", operation, exc, exc_info=True)
            raise AppException(
                "Gagal terhubung ke database. Coba lagi dalam beberapa saat.",
                code="DATABASE_CONNECTION_ERROR",
                status_code=503,
            ) from exc

    if last_error:
        raise last_error


def require_rows(result, *, resource: str = "Data") -> list:
    """Ensure a select/insert result contains at least one row."""
    rows = result.data or []
    if not rows:
        raise NotFoundException(f"{resource} tidak ditemukan")
    return rows
