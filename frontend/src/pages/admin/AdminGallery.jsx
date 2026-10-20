import React, { useState, useEffect } from 'react';
import galleryService from '../../services/galleryService';
import { SkeletonGrid } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconPlus, IconEdit, IconTrash } from '../../components/common/Icons';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGallery = async (p = 1) => {
    setLoading(true);
    try {
      const res = await galleryService.getAdminGallery({ page: p, per_page: 12 });
      setItems(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat galeri', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(page);
  }, [page]);

  const handleOpenUpload = () => {
    setImageFile(null);
    setCaption('');
    setIsUploadModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setCaption(item.caption || '');
    setIsEditModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    setSubmitting(true);
    try {
      await galleryService.createGalleryItem(imageFile, caption);
      showToast('Foto berhasil ditambahkan ke galeri');
      setIsUploadModalOpen(false);
      fetchGallery(page);
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan foto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCaption = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await galleryService.updateGalleryItem(currentItem.id, caption);
      showToast('Caption berhasil diperbarui');
      setIsEditModalOpen(false);
      fetchGallery(page);
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui caption', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await galleryService.deleteGalleryItem(deleteTarget.id);
      showToast('Foto berhasil dihapus dari galeri');
      setDeleteTarget(null);
      fetchGallery(page);
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
          <h1>Galeri Foto Kegiatan</h1>
          <p>Kumpulkan dan publikasikan album foto kegiatan Forum GenRe Buleleng</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenUpload} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Upload Foto Baru</span>
        </button>
      </div>

      <div className="dash-panel">
        {loading ? (
          <SkeletonGrid count={8} />
        ) : items.length === 0 ? (
          <div className="dash-empty">Galeri masih kosong. Mulai upload foto kegiatan pertama Anda.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {items.map((item) => (
                <div key={item.id} className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                    <img
                      src={item.image_url}
                      alt={item.caption}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', minHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.caption || '(Tidak ada caption)'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      className="btn btn-outline btn-xs"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => handleOpenEdit(item)}
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
                </div>
              ))}
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

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Foto Baru"
      >
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">File Gambar *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="caption">Caption Foto (keterangan kegiatan) *</label>
            <textarea
              id="caption"
              className="form-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              placeholder="Contoh: Rapat kerja pengurus Forum GenRe Buleleng 2026"
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsUploadModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} disabled={submitting || !imageFile}>
              <IconPlus size={16} />
              <span>{submitting ? 'Mengunggah...' : 'Upload & Publikasikan'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Caption Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Caption Foto"
      >
        <form onSubmit={handleUpdateCaption} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentItem && (
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <img
                src={currentItem.image_url}
                alt="Galeri"
                style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-caption">Keterangan Foto / Caption *</label>
            <textarea
              id="edit-caption"
              className="form-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Perbarui Caption'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Foto Galeri"
        message="Apakah Anda yakin ingin menghapus foto ini secara permanen dari galeri?"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminGallery;
