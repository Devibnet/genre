"""Slug generation and collision resolution module."""

import re
import unicodedata
from typing import Optional
from app.extensions.supabase import get_supabase_admin_client


def slugify(text: str) -> str:
    """Convert text into a URL-friendly slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = text.strip("-")
    return text or "untitled"


def generate_unique_slug(
    table_name: str,
    title: str,
    provided_slug: Optional[str] = None,
    exclude_id: Optional[str] = None
) -> str:
    """Generate a unique slug for a database table, appending a numeric suffix if needed."""
    base_slug = slugify(provided_slug if provided_slug and provided_slug.strip() else title)
    client = get_supabase_admin_client()

    candidate_slug = base_slug
    counter = 1

    while True:
        query = client.table(table_name).select("id").eq("slug", candidate_slug)
        if exclude_id:
            query = query.neq("id", exclude_id)
        res = query.execute()

        if not res.data:
            return candidate_slug

        candidate_slug = f"{base_slug}-{counter}"
        counter += 1
