# Backend REST API Forum GenRe Kabupaten Buleleng

Official REST API Backend untuk website resmi **Forum GenRe Kabupaten Buleleng**. 

Dikembangkan menggunakan **Python 3.12+**, **Flask (Application Factory Pattern)**, **Supabase PostgreSQL** (Database Source of Truth), **Supabase Storage**, dan **Supabase Auth**.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Prasyarat Systems](#-prasyarat-systems)
3. [Instalasi & Setup Project](#-instalasi--setup-project)
4. [Environment Variables](#-environment-variables)
5. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
6. [Struktur Folder](#-struktur-folder)
7. [Dokumentasi API Endpoints](#-dokumentasi-api-endpoints)
8. [Autentikasi Admin](#-autentikasi-admin)
9. [Manajemen Storage & File Upload](#-manajemen-storage--file-upload)
10. [Format Response & Status Code](#-format-response--status-code)
11. [Running Tests](#-running-tests)

---

## 🚀 Fitur Utama

- **Public API (Tanpa Login)**:
  - Homepage data aggregator (`GET /api/v1/home`).
  - Artikel Pusat Edukasi (pagination, search, sorting).
  - Berita Program Kerja & Foto Dokumentasi.
  - Quiz Edukasi & Grading Server-side (Kunci jawaban `is_correct` **tidak pernah dibocorkan**).
  - Galeri Kegiatan Sederhana.
  - Konselor Sebaya Berstatus Active (Integrasi WhatsApp direct link tanpa menyimpan cerita di DB).
  - Pengaturan & Kontak Website.
- **Admin API (Membutuhkan Bearer JWT & Admin Role)**:
  - CMS Artikel (CRUD, Publish, Unpublish, Upload/Delete Cover).
  - CMS Quiz (CRUD Quiz, Soal/Questions, Opsi/Options, Publish validation).
  - CMS Program News (CRUD Berita, Publish, Cover & Multi-photo Upload Documentation).
  - CMS Galeri (Upload foto & caption, Edit caption, Delete foto & file storage).
  - CMS Konselor Sebaya (CRUD Data Konselor & Foto).
  - CMS Site Settings (Single-record website settings & Logo upload).
- **Security & Integrity**:
  - `SUPABASE_SERVICE_ROLE_KEY` hanya di Flask backend.
  - Pydantic v2 Strong Schema Validation.
  - Automatic orphan file cleanup di Supabase Storage jika terjadi kegagalan transaksi DB.

---

## 🛠 Prasyarat Systems

- Python 3.12+
- Supabase Project (PostgreSQL Database, Auth, Storage Bucket `website`)
- pip & venv

---

## 📦 Instalasi & Setup Project

1. **Clone repository & masuk ke direktori backend**:
   ```bash
   cd websitegenbul
   ```

2. **Buat virtual environment Python**:
   ```bash
   python -m venv venv
   ```

3. **Aktifkan virtual environment**:
   - **Windows**:
     ```powershell
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 🔑 Environment Variables

Salin `.env.example` menjadi `.env` dan isi credential Supabase Anda:

```bash
cp .env.example .env
```

Contoh isi `.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-in-production

# CORS Configuration (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Storage Configuration
SUPABASE_STORAGE_BUCKET=website
```

---

## 💻 Menjalankan Aplikasi

### Development Mode:
```bash
python run.py
```
atau:
```bash
flask run
```
Server akan berjalan secara default pada `http://localhost:5000`.

### Production Mode (Gunicorn / Waitress):
- **Linux (Gunicorn)**:
  ```bash
  gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
  ```
- **Windows (Waitress)**:
  ```bash
  pip install waitress
  waitress-serve --port=5000 app:create_app
  ```

---

## 📂 Struktur Folder

```
backend/
├── app/
│   ├── __init__.py            # Application Factory create_app()
│   ├── config/                # App Settings & Environment Config
│   ├── extensions/            # Supabase Client Extension
│   ├── middleware/            # Auth (@require_admin) & Error Handlers
│   ├── utils/                 # Response, Validation, Slug & Storage Helpers
│   ├── schemas/               # Pydantic Schemas & Response DTOs
│   ├── services/              # Business Logic & DB operations
│   └── routes/                # Flask Blueprints
├── tests/                     # Pytest suite
├── .env.example
├── .env
├── requirements.txt
├── pytest.ini
├── run.py
└── README.md
```

---

## 📑 Dokumentasi API Endpoints

Semua endpoint API diprefix dengan `/api/v1`.

### 🏥 Health Check
- `GET /health` — Status kesehatan aplikasi.
- `GET /health/db` — Status koneksi database Supabase.

### 🏠 Homepage
- `GET /api/v1/home` — Agregasi data teratur untuk homepage React (settings, 6 featured articles, 6 latest news, 8 featured gallery, 4 active counselors).

### 📰 Artikel (Pusat Edukasi)
- `GET /api/v1/articles?page=1&per_page=10&search=stunting` — Artikel published.
- `GET /api/v1/articles/<slug>` — Detail artikel published.
- `GET /api/v1/admin/articles` — Admin list seluruh artikel.
- `POST /api/v1/admin/articles` — Admin create artikel.
- `PUT /api/v1/admin/articles/<id>` — Admin update artikel.
- `DELETE /api/v1/admin/articles/<id>` — Admin delete artikel & cover image.
- `POST /api/v1/admin/articles/<id>/publish` — Set status `published`.
- `POST /api/v1/admin/articles/<id>/unpublish` — Set status `draft`.
- `POST /api/v1/admin/articles/<id>/cover` — Upload foto cover.
- `DELETE /api/v1/admin/articles/<id>/cover` — Hapus foto cover.

### 🧩 Quiz
- `GET /api/v1/quizzes` — List quiz published.
- `GET /api/v1/quizzes/<id>` — Detail quiz published.
- `GET /api/v1/quizzes/<id>/questions` — Soal quiz (HIDES `is_correct`).
- `POST /api/v1/quizzes/<id>/submit` — Submisi jawaban untuk grading server-side (Tanpa simpan DB).
- `GET /api/v1/admin/quizzes` — Admin list quiz.
- `POST /api/v1/admin/quizzes` — Admin create quiz.
- `POST /api/v1/admin/quizzes/<id>/publish` — Publish quiz (Validasi min 1 soal & min 2 opsi per soal).
- `POST /api/v1/admin/quizzes/<quiz_id>/questions` — Add question.
- `POST /api/v1/admin/questions/<question_id>/options` — Add option.

### 📢 Program News
- `GET /api/v1/news` — List berita program kerja published.
- `GET /api/v1/news/<slug>` — Detail berita beserta foto dokumentasi.
- `GET /api/v1/admin/news` — Admin list berita.
- `POST /api/v1/admin/news` — Admin create berita.
- `POST /api/v1/admin/news/<id>/photos` — Upload foto dokumentasi berita.

### 🖼 Galeri
- `GET /api/v1/gallery` — List foto galeri.
- `POST /api/v1/admin/gallery` — Upload foto galeri (`image` file + `caption`).
- `PUT /api/v1/admin/gallery/<id>` — Edit caption.
- `DELETE /api/v1/admin/gallery/<id>` — Delete foto & hapus file dari Supabase storage.

### 👥 Konselor Sebaya
- `GET /api/v1/counselors` — List konselor `active`.
- `POST /api/v1/admin/counselors` — Admin create konselor.
- `POST /api/v1/admin/counselors/<id>/photo` — Upload foto konselor.

### ⚙️ Site Settings
- `GET /api/v1/settings` — Pengaturan website & kontak.
- `PUT /api/v1/admin/settings` — Edit pengaturan website.
- `POST /api/v1/admin/settings/logo` — Upload logo website.

---

## 🔒 Autentikasi Admin

Admin dapat melakukan login melalui proxy endpoint:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@genre.bulelengkab.go.id",
  "password": "your-password"
}
```

Sistem akan mengembalikan Supabase JWT:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "user": { ... },
    "profile": { "role": "admin" }
  }
}
```

Sertakan token tersebut di setiap request endpoint admin:
```http
Authorization: Bearer <access_token>
```

---

## 📤 Manajemen Storage & File Upload

File disuplai menggunakan `multipart/form-data`:
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
- Max file size: 5 MB per gambar
- Storage Bucket: `website`
- Path otomatis digenerate dengan UUID unik (misal: `gallery/550e8400-e29b-41d4-a716-446655440000.webp`).

---

## 📊 Format Response & Status Code

### Success Response (Single Data):
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": { ... }
}
```

### Success Response (Paginated List):
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Artikel tidak ditemukan",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

## 🧪 Running Tests

Jalankan pengujian unit dan integrasi dengan command `pytest`:

```bash
pytest
```

Untuk melihat detail verbose dan log trace:
```bash
pytest -v --tb=short
```
