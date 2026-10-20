"""Storage service handling Supabase Storage operations."""

import logging
from typing import Optional
from werkzeug.datastructures import FileStorage
from app.extensions.supabase import get_supabase_admin_client
from app.config.settings import get_config
from app.utils.storage import validate_image_file, generate_storage_path
from app.middleware.error_handler import StorageException

logger = logging.getLogger(__name__)


class StorageService:
    """Reusable service for uploading, replacing, and deleting files in Supabase Storage."""

    @staticmethod
    def upload_image(file: FileStorage, folder: str) -> str:
        """Validate and upload an image file to Supabase Storage.

        Returns:
            Relative storage path (e.g., 'articles/covers/uuid.webp')
        """
        content_type, ext = validate_image_file(file)
        storage_path = generate_storage_path(folder, ext)

        cfg = get_config()
        bucket_name = cfg.SUPABASE_STORAGE_BUCKET
        client = get_supabase_admin_client()

        file.seek(0)
        file_bytes = file.read()

        try:
            res = client.storage.from_(bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            logger.info("Successfully uploaded image to %s", storage_path)
            return storage_path
        except Exception as e:
            logger.error("Failed to upload image to Supabase Storage: %s", str(e))
            raise StorageException("Failed to upload file to storage", details=str(e))

    @staticmethod
    def delete_file(storage_path: Optional[str]) -> bool:
        """Delete a file from Supabase Storage given its relative storage path or public URL."""
        if not storage_path:
            return True

        # Extract relative path if a full public URL was passed
        clean_path = storage_path
        cfg = get_config()
        bucket_name = cfg.SUPABASE_STORAGE_BUCKET
        public_prefix = f"/storage/v1/object/public/{bucket_name}/"

        if public_prefix in clean_path:
            clean_path = clean_path.split(public_prefix)[-1]
        clean_path = clean_path.lstrip("/")

        client = get_supabase_admin_client()

        try:
            client.storage.from_(bucket_name).remove([clean_path])
            logger.info("Successfully deleted image from storage: %s", clean_path)
            return True
        except Exception as e:
            logger.warning("Failed to delete storage file %s: %s", clean_path, str(e))
            return False

    @staticmethod
    def replace_image(file: FileStorage, folder: str, old_storage_path: Optional[str]) -> str:
        """Upload new image and delete old image upon success."""
        new_path = StorageService.upload_image(file, folder)
        if old_storage_path:
            StorageService.delete_file(old_storage_path)
        return new_path
