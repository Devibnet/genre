import React, { useState, useEffect } from 'react';
import newsService from '../../services/newsService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconImage } from '../../components/common/Icons';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);

  // Delete Confirm States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteCoverTarget, setDeleteCoverTarget] = useState(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    status: 'draft',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNews = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await newsService.getAdminNews({ page: p, per_page: 10, search: q || undefined });
      setNews(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat berita', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleOpenAdd = () => {
    setCurrentNews(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentNews(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      event_date: item.event_date ? item.event_date.split('T')[0] : '',
      status: item.status || 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenCover = (item) => {
    setCurrentNews(item);
    setCoverFile(null);
    setIsCoverModalOpen(true);
  };

  const handleOpenGallery = async (item) => {
    setLoading(true);
    try {
      const fullNews = await newsService.getAdminNewsById(item.id);
      setCurrentNews(fullNews);
      setNewPhotoFile(null);
      setNewPhotoCaption('');
      setIsGalleryModalOpen(true);
    } catch (err) {
      showToast('Gagal memuat galeri foto kegiatan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentNews) {
        // Edit: hanya update teks, foto cover dikelola lewat modal Cover terpisah
        await newsService.updateNews(currentNews.id, formData);
        showToast('Berita berhasil diperbarui');
      } else {
        // Create: buat berita dulu, lalu otomatis upload foto sebagai cover
        const created = await newsService.createNews(formData);
        if (coverFile && created?.id) {
          try {
            await newsService.uploadCover(created.id, coverFile);
          } catch {
            showToast('Berita dibuat, tapi gagal upload foto cover.', 'error');
          }
        }
        showToast('Berita berhasil dibuat');
        setCoverFile(null);
      }
      setIsModalOpen(false);
      fetchNews(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan berita', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await newsService.deleteNews(deleteTarget.id);
      showToast('Berita berhasil dihapus');
      setDeleteTarget(null);
      fetchNews(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus berita', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === 'published') {
        await newsService.unpublishNews(item.id);
        showToast('Berita diubah menjadi Draft');
      } else {
        await newsService.publishNews(item.id);
        showToast('Berita berhasil dipublikasikan');
      }
      fetchNews(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status publikasi', 'error');
    }
  };

  const handleUploadCover = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    setSubmitting(true);
    try {
      await newsService.uploadCover(currentNews.id, coverFile);
      showToast('Cover berita berhasil diupload');
      setIsCoverModalOpen(false);
      fetchNews(page, search);
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
      await newsService.deleteCover(deleteCoverTarget.id);
      showToast('Cover berita dihapus');
      setDeleteCoverTarget(null);
      setIsCoverModalOpen(false);
      fetchNews(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus cover', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Gallery Operations
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoFile) return;
    setSubmitting(true);
    try {
      const order = currentNews.photos ? currentNews.photos.length + 1 : 1;
      await newsService.addNewsPhoto(currentNews.id, newPhotoFile, newPhotoCaption, order);
      showToast('Foto dokumentasi berhasil ditambahkan');
      // Refresh current news photos
      const fullNews = await newsService.getAdminNewsById(currentNews.id);
      setCurrentNews(fullNews);
      setNewPhotoFile(null);
      setNewPhotoCaption('');
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan foto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!deletePhotoTarget) return;
    setIsDeleting(true);
    try {
      await newsService.deleteNewsPhoto(deletePhotoTarget.id);
      showToast('Foto berhasil dihapus');
      setDeletePhotoTarget(null);
      const fullNews = await newsService.getAdminNewsById(currentNews.id);
      setCurrentNews(fullNews);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus foto', 'error');
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
          <h1>Manajemen Berita & Program Kerja</h1>
          <p>Kelola liputan berita, program kerja, dan album dokumentasi kegiatan</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Tambah Berita</span>
        </button>
      </div>

      <div className="dash-panel">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input"
            placeholder="Cari judul..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconSearch size={16} />
            <span>Cari</span>
          </button>
        </form>

        {loading && news.length === 0 ? (
          <SkeletonTable rows={5} cols={5} />
        ) : news.length === 0 ? (
          <div className="dash-empty">Belum ada liputan berita kegiatan.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Judul Berita</th>
                    <th>Tanggal Kegiatan</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt={item.title}
                            style={{
                              width: '60px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleOpenCover(item)}
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
                            onClick={() => handleOpenCover(item)}
                          >
                            <IconImage size={18} color="var(--slate-400)" />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                          /{item.slug}
                        </div>
                      </td>
                      <td>{item.event_date ? formatDate(item.event_date) : '-'}</td>
                      <td>
                        <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-primary'}`}>
                          {item.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenGallery(item)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconImage size={14} />
                            <span>Foto ({item.photos_count || 0})</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleTogglePublish(item)}
                          >
                            {item.status === 'published' ? 'Draftkan' : 'Publish'}
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(item)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteTarget(item)}
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

      {/* Add / Edit News Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentNews ? 'Edit Berita' : 'Tambah Berita Baru'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Judul Berita *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Masukkan judul berita"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="event_date">Tanggal Pelaksanaan Kegiatan *</label>
            <input
              type="date"
              id="event_date"
              name="event_date"
              className="form-input"
              value={formData.event_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Deskripsi Lengkap *</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Tulis detail liputan atau jalannya program kerja..."
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
          {/* Foto cover — hanya saat membuat berita baru */}
          {!currentNews && (
            <div className="form-group">
              <label className="form-label" htmlFor="cover_file">
                Foto Cover Berita <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(opsional, langsung jadi cover)</span>
              </label>
              <input
                type="file"
                id="cover_file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
              />
              {coverFile && (
                <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '6px' }}>
                  {coverFile.name}
                </p>
              )}
            </div>
          )}
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

      {/* Cover Modal */}
      <Modal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        title="Cover Berita"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {currentNews?.cover_url ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <img
                src={currentNews.cover_url}
                alt="Cover"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setDeleteCoverTarget(currentNews)}
                disabled={submitting}
              >
                <IconTrash size={14} />
                <span>Hapus Cover Gambar</span>
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--slate-400)' }}>Belum ada cover berita.</p>
          )}

          <form onSubmit={handleUploadCover} style={{ width: '100%', borderTop: '1px solid var(--slate-200)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} required />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsCoverModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !coverFile}>Upload</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Multiple Photos Documentation Modal */}
      <Modal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        title={`Dokumentasi Berita: ${currentNews?.title}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add photo form */}
          <form onSubmit={handleAddPhoto} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontWeight: 700 }}>Tambah Foto Dokumentasi</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
              <div>
                <label className="form-label">Pilih File Gambar</label>
                <input type="file" accept="image/*" onChange={(e) => setNewPhotoFile(e.target.files[0])} required />
              </div>
              <div>
                <label className="form-label">Keterangan / Caption (opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Sambutan Ketua Panitia"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '6px' }} disabled={submitting || !newPhotoFile}>
              <IconPlus size={16} />
              <span>{submitting ? 'Mengunggah...' : 'Upload & Tambahkan'}</span>
            </button>
          </form>

          {/* List existing photos */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>Daftar Foto Dokumentasi</h4>
            {!currentNews?.photos || currentNews.photos.length === 0 ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>Belum ada foto dokumentasi di berita ini.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {currentNews.photos.map((photo) => (
                  <div key={photo.id} className="glass-panel" style={{ padding: '8px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <img
                      src={photo.image_url}
                      alt={photo.caption}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', minHeight: '32px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {photo.caption || '(Tanpa caption)'}
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline btn-xs"
                      style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => setDeletePhotoTarget(photo)}
                    >
                      <IconTrash size={14} />
                      <span>Hapus Foto</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berita"
        message={`Apakah Anda yakin ingin menghapus berita "${deleteTarget?.title}" beserta seluruh foto dokumentasinya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={Boolean(deleteCoverTarget)}
        onClose={() => setDeleteCoverTarget(null)}
        onConfirm={handleConfirmDeleteCover}
        title="Hapus Cover Berita"
        message="Apakah Anda yakin ingin menghapus gambar cover dari berita ini?"
        confirmText="Hapus Cover"
        cancelText="Batal"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={Boolean(deletePhotoTarget)}
        onClose={() => setDeletePhotoTarget(null)}
        onConfirm={handleConfirmDeletePhoto}
        title="Hapus Foto Dokumentasi"
        message="Apakah Anda yakin ingin menghapus foto dokumentasi ini dari galeri berita?"
        confirmText="Hapus Foto"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminNews;
