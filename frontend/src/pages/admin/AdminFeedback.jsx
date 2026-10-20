import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';
import { IconSearch, IconRefresh, IconEye, IconTrash } from '../../components/common/Icons';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Detail Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFeedbacks = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await feedbackService.getAdminFeedback({
        page: p,
        per_page: 10,
        search: q || undefined,
      });
      setFeedbacks(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat masukan & saran', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(page, search);
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await feedbackService.deleteFeedback(deleteTarget.id);
      showToast('Masukan berhasil dihapus');
      setDeleteTarget(null);
      if (selectedFeedback && selectedFeedback.id === deleteTarget.id) {
        setSelectedFeedback(null);
      }
      fetchFeedbacks(page, search);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus masukan', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
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

      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Masukan &amp; Saran</h1>
          <p>Kelola aspirasi, masukan, dan saran yang dikirim oleh pengunjung website</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="dash-panel" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari berdasarkan nama atau isi masukan..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IconSearch size={16} />
            <span>Cari</span>
          </button>
          {(search || searchInput) && (
            <button type="button" className="btn btn-secondary" onClick={handleClearSearch}>
              Reset
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchFeedbacks(page, search)}
            title="Muat ulang data"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconRefresh size={16} />
            <span>Refresh</span>
          </button>
        </form>
      </div>

      {/* Content Panel */}
      <div className="dash-panel">
        {loading && feedbacks.length === 0 ? (
          <SkeletonTable rows={5} cols={4} />
        ) : feedbacks.length === 0 ? (
          <div className="dash-empty" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '8px' }}>
              {search ? 'Tidak ada masukan yang cocok dengan pencarian.' : 'Belum ada masukan atau saran masuk.'}
            </p>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              Masukan dari pengunjung website melalui formulir kontak akan muncul di sini.
            </p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table feedback-admin-table">
                <thead>
                  <tr>
                    <th>Nama Pengirim</th>
                    <th>Isi Masukan &amp; Saran</th>
                    <th>Waktu Dikirim</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((fb) => (
                    <tr key={fb.id}>
                      <td>
                        <div className="feedback-name-cell">
                          <span className="feedback-avatar">{getInitial(fb.name)}</span>
                          <span>{fb.name}</span>
                        </div>
                      </td>
                      <td>
                        <p
                          className="feedback-message-preview"
                          onClick={() => setSelectedFeedback(fb)}
                          title="Klik untuk membaca selengkapnya"
                        >
                          {fb.message}
                        </p>
                      </td>
                      <td style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
                        {fb.created_at ? formatDate(fb.created_at) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedFeedback(fb)}
                            title="Lihat Detail"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEye size={14} />
                            <span>Detail</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(fb)}
                            title="Hapus Masukan"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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

            {/* Pagination Controls */}
            {meta.total_pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--slate-200)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>
                  Menampilkan halaman {meta.page} dari {meta.total_pages} (Total: {meta.total} masukan)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    &larr; Sebelumnya
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Selanjutnya &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFeedback(null)}
          title="Detail Masukan & Saran"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="feedback-meta-item">
              <span className="feedback-meta-label">Nama Pengirim</span>
              <span className="feedback-meta-val">{selectedFeedback.name}</span>
            </div>
            <div className="feedback-meta-item">
              <span className="feedback-meta-label">Tanggal Masuk</span>
              <span className="feedback-meta-val">
                {selectedFeedback.created_at ? formatDate(selectedFeedback.created_at) : '-'}
              </span>
            </div>
            <div>
              <p className="feedback-meta-label" style={{ marginBottom: '8px' }}>
                Isi Masukan / Saran:
              </p>
              <div className="feedback-detail-box">{selectedFeedback.message}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setDeleteTarget(selectedFeedback);
                }}
              >
                Hapus
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedFeedback(null)}>
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Masukan"
        message={`Apakah Anda yakin ingin menghapus masukan dari "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminFeedback;
