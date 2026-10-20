import React, { useState, useEffect } from 'react';
import articleService from '../../services/articleService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconImage } from '../../components/common/Icons';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  // Delete Confirm States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteCoverTarget, setDeleteCoverTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    drive_url: '',
    status: 'draft',
    slug: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await articleService.getAdminArticles({ page: p, per_page: 10, search: q || undefined });
      setArticles(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat artikel', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleOpenAdd = () => {
    setCurrentArticle(null);
    setFormData({
      title: '',
      description: '',
      drive_url: '',
      status: 'draft',
      slug: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setCurrentArticle(art);
    setFormData({
      title: art.title || '',
      description: art.description || '',
      drive_url: art.drive_url || '',
      status: art.status || 'draft',
      slug: art.slug || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenCover = (art) => {
    setCurrentArticle(art);
    setCoverFile(null);
    setIsCoverModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentArticle) {
        // Update
        await articleService.updateArticle(currentArticle.id, formData);
        showToast('Artikel berhasil diperbarui');
      } else {
        // Create
        await articleService.createArticle(formData);
        showToast('Artikel berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchArticles(page, search);
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(deleteTarget.id);
      showToast('Artikel berhasil dihapus');
      setDeleteTarget(null);
      fetchArticles(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus artikel', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (art) => {
    try {
      if (art.status === 'published') {
        await articleService.unpublishArticle(art.id);
        showToast('Artikel diubah menjadi Draft');
      } else {
        await articleService.publishArticle(art.id);
        showToast('Artikel berhasil dipublikasikan');
      }
      fetchArticles(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status publikasi', 'error');
    }
  };

  const handleUploadCover = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    setSubmitting(true);
    try {
      await articleService.uploadCover(currentArticle.id, coverFile);
      showToast('Cover gambar berhasil diupload');
      setIsCoverModalOpen(false);
      fetchArticles(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal mengupload cover', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteCover = async () => {
    if (!deleteCoverTarget) return;
    setIsDeleting(true);
    try {
      await articleService.deleteCover(deleteCoverTarget.id);
      showToast('Cover gambar dihapus');
      setDeleteCoverTarget(null);
      setIsCoverModalOpen(false);
      fetchArticles(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus cover', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Manajemen Artikel</h1>
          <p>Tulis dan kelola artikel edukasi untuk remaja</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Tambah Artikel</span>
        </button>
      </div>

      <div className="dash-panel">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari judul atau slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconSearch size={16} />
            <span>Cari</span>
          </button>
        </form>

        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : articles.length === 0 ? (
          <div className="dash-empty">Belum ada artikel ditemukan.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Judul / Slug</th>
                    <th>Status</th>
                    <th>Tanggal Dibuat</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id}>
                      <td>
                        {art.cover_url ? (
                          <img
                            src={art.cover_url}
                            alt={art.title}
                            style={{
                              width: '60px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleOpenCover(art)}
                          />
                        ) : (
                          <div
                            style={{
                              width: '60px',
                              height: '40px',
                              backgroundColor: 'var(--slate-100)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              color: 'var(--slate-400)',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleOpenCover(art)}
                          >
                            <IconImage size={18} color="var(--slate-400)" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{art.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                          /{art.slug}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${art.status === 'published' ? 'badge-success' : 'badge-primary'}`}>
                          {art.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>{formatDate(art.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleTogglePublish(art)}
                          >
                            {art.status === 'published' ? 'Draftkan' : 'Publish'}
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(art)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteTarget(art)}
                          >
                            <IconTrash size={14} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.total_pages > 1 && (
              <div className="pagination" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  &larr; Sebelumnya
                </button>
                <span className="page-info">
                  Halaman {page} dari {meta.total_pages}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Write/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Judul Artikel *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Masukkan judul artikel"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="slug">Slug (URL Custom)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              className="form-input"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="biarkan kosong untuk auto-generate dari judul"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="drive_url">Google Drive Link (Materi PDF/PPT)</label>
            <input
              type="url"
              id="drive_url"
              name="drive_url"
              className="form-input"
              value={formData.drive_url}
              onChange={handleInputChange}
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Isi / Deskripsi Artikel *</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Tulis artikel disini..."
              rows={8}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cover Image Upload Modal */}
      <Modal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        title="Kelola Gambar Cover"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {currentArticle?.cover_url ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '8px' }}>Cover Saat Ini:</p>
              <img
                src={currentArticle.cover_url}
                alt="Cover"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setDeleteCoverTarget(currentArticle)}
                disabled={submitting}
              >
                <IconTrash size={14} />
                <span>Hapus Cover Gambar</span>
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>Belum ada cover gambar.</p>
          )}

          <div style={{ width: '100%', borderTop: '1px solid var(--slate-200)', paddingTop: '20px' }}>
            <form onSubmit={handleUploadCover} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Upload Cover Baru</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsCoverModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !coverFile}>
                  {submitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Artikel"
        message={`Apakah Anda yakin ingin menghapus artikel "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={Boolean(deleteCoverTarget)}
        onClose={() => setDeleteCoverTarget(null)}
        onConfirm={handleConfirmDeleteCover}
        title="Hapus Cover Gambar"
        message="Apakah Anda yakin ingin menghapus gambar cover dari artikel ini?"
        confirmText="Hapus Cover"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminArticles;
