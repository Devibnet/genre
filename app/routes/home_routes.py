"""Homepage route module."""

from flask import Blueprint
from app.services.home_service import HomeService
from app.utils.response import success_response

home_bp = Blueprint("home", __name__, url_prefix="/api/v1")


@home_bp.get("/home")
def get_homepage_content():
    """Retrieve aggregated homepage data for React frontend."""
    data = HomeService.get_homepage_data()
    return success_response(data=data, message="Homepage data successfully retrieved")
