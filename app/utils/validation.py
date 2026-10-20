"""Validation utilities for Pydantic schemas."""

from typing import Type, TypeVar, Any
from functools import wraps
from flask import request
from pydantic import BaseModel, ValidationError as PydanticValidationError
from app.middleware.error_handler import ValidationException

T = TypeVar("T", bound=BaseModel)


def validate_schema(schema_cls: Type[T], data: Any) -> T:
    """Validate data dictionary against a Pydantic schema class."""
    try:
        if not isinstance(data, dict):
            data = {}
        return schema_cls.model_validate(data)
    except PydanticValidationError as e:
        errors = e.errors()
        formatted_errors = [
            {"field": ".".join(str(loc) for loc in err["loc"]), "message": err["msg"]}
            for err in errors
        ]
        raise ValidationException(message="Validation failed", details=formatted_errors)


def validate_request(schema_cls: Type[T]):
    """Decorator to validate JSON request body with Pydantic model."""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            json_data = request.get_json(silent=True) or {}
            validated_data = validate_schema(schema_cls, json_data)
            kwargs["validated_data"] = validated_data
            return f(*args, **kwargs)

        return decorated

    return decorator
