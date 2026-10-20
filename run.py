"""Application entry point for Forum GenRe Buleleng REST API."""

import os
import socket
import sys

from app import create_app

app = create_app()


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(("127.0.0.1", port)) == 0


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"

    if _port_in_use(port):
        print(
            f"\n[ERROR] Port {port} sudah digunakan oleh proses lain.\n"
            "Hentikan server Flask/Laragon yang lama sebelum menjalankan backend ini.\n"
            "Contoh: tutup terminal `flask run` atau hentikan proses di Laragon,\n"
            f"lalu jalankan ulang: python run.py\n",
            file=sys.stderr,
        )
        sys.exit(1)

    app.run(host="0.0.0.0", port=port, debug=debug)
