import React, { useState, useEffect } from 'react';
import counselingService from '../../services/counselingService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { formatDate } from '../../utils/formatDate';
import { IconTrash, IconEye } from '../../components/common/Icons';

const AdminCounseling = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Detail Modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRequests = async (p = 1) => {
    setLoading(true);
    try {
      const res = await counselingService.getCounselingRequests({ page: p, per_page: 10 });
      setRequests(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat permintaan konseling', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(page);
  }, [page]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await counselingService.updateCounselingStatus(id, newStatus);
      showToast(`Status permintaan berhasil diubah ke ${newStatus}`);
      fetchRequests(page);
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await counselingService.deleteCounselingRequest(deleteTarget.id);
      showToast('Permintaan konseling berhasil dihapus');
      setDeleteTarget(null);
      if (selectedRequest && selectedRequest.id === deleteTarget.id) {
        setSelectedRequest(null);
      }
      fetchRequests(page);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus permintaan', 'error');
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
          <h1>Permintaan Konseling</h1>
          <p>Kelola permohonan curhat/konseling remaja yang masuk melalui situs</p>
        </div>
      </div>

      <div className="dash-panel">
        {loading && requests.length === 0 ? (
          <SkeletonTable rows={5} cols={6} />
        ) : requests.length === 0 ? (
          <div className="dash-empty">Belum ada permintaan konseling masuk.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama Pemohon</th>
                    <th>WhatsApp / Email</th>
                    <th>Konselor Terpilih</th>
                    <th>Tanggal Rencana</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{req.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                          Dibuat: {formatDate(req.created_at)}
                        </div>
                      </td>
                      <td>
                        <div>
                          <a
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 500 }}
                          >
                            {req.phone}
                          </a>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                          {req.email}
                        </div>
                      </td>
                      <td>
                        {req.counselor_name || <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Konselor Bebas</span>}
                      </td>
                      <td>{req.preferred_date ? formatDate(req.preferred_date) : '-'}</td>
                      <td>
                        <span className={`status-badge status-${req.status}`}>
                          {req.status === 'pending' ? 'Menunggu' : req.status === 'confirmed' ? 'Dikonfirmasi' : req.status === 'completed' ? 'Selesai' : req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedRequest(req)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEye size={14} />
                            <span>Detail</span>
                          </button>
                          {req.status === 'pending' && (
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => handleUpdateStatus(req.id, 'confirmed')}
                            >
                              Konfirmasi
                            </button>
                          )}
                          {req.status === 'confirmed' && (
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() => handleUpdateStatus(req.id, 'completed')}
                            >
                              Selesai
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteTarget(req)}
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

      {/* Counseling Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Detail Permintaan Konseling"
      >
        {selectedRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Nama Pemohon</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--dark)' }}>{selectedRequest.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Status Permohonan</p>
                <span className={`status-badge status-${selectedRequest.status}`} style={{ display: 'inline-block', marginTop: '4px' }}>
                  {selectedRequest.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Nomor WhatsApp</p>
                <a
                  href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}
                >
                  {selectedRequest.phone}
                </a>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Email</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)' }}>{selectedRequest.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Konselor Terpilih</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)', fontWeight: 500 }}>
                  {selectedRequest.counselor_name || 'Konselor Bebas'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Rencana Tanggal</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--slate-700)' }}>
                  {selectedRequest.preferred_date ? formatDate(selectedRequest.preferred_date) : '(Tidak ditentukan)'}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '8px' }}>Keluhan / Masalah yang Dihadapi</p>
              <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderLeft: '3px solid var(--primary)', borderRadius: 'var(--radius-sm)', color: 'var(--slate-700)', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {selectedRequest.problem}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {selectedRequest.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'confirmed')}
                >
                  Setujui & Konfirmasi
                </button>
              )}
              {selectedRequest.status === 'confirmed' && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')}
                >
                  Selesai Konseling
                </button>
              )}
              {selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                >
                  Batalkan
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setDeleteTarget(selectedRequest)}
              >
                <IconTrash size={14} />
                <span>Hapus Permanen</span>
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedRequest(null)}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Permintaan Konseling"
        message={`Apakah Anda yakin ingin menghapus permintaan konseling dari "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCounseling;
