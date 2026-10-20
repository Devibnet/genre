import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import articleService from '../../services/articleService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconPlus, IconEdit, IconTrash, IconBook } from '../../components/common/Icons';

const IconChart = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    article_id: '',
    duration: '',
    status: 'draft',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizzes = async (p = 1) => {
    setLoading(true);
    try {
      const [quizzesRes, articlesRes] = await Promise.all([
        quizService.getAdminQuizzes({ page: p, per_page: 10 }),
        articleService.getAdminArticles({ per_page: 100 }),
      ]);
      setQuizzes(quizzesRes.data || []);
      setMeta(quizzesRes.meta || {});
      setArticles(articlesRes.data || []);
    } catch (err) {
      showToast(err.message || 'Gagal memuat kuis', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(page);
  }, [page]);

  const handleOpenAdd = () => {
    setCurrentQuiz(null);
    setFormData({
      title: '',
      description: '',
      article_id: '',
      duration: '',
      status: 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (qz) => {
    setCurrentQuiz(qz);
    setFormData({
      title: qz.title || '',
      description: qz.description || '',
      article_id: qz.article_id || '',
      duration: qz.duration || '',
      status: qz.status || 'draft',
    });
    setIsModalOpen(true);
  };

  const handleOpenThumbnail = (qz) => {
    setCurrentQuiz(qz);
    setThumbnailFile(null);
    setIsThumbnailModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        article_id: formData.article_id || null,
      };

      if (currentQuiz) {
        await quizService.updateQuiz(currentQuiz.id, payload);
        showToast('Kuis berhasil diperbarui');
      } else {
        await quizService.createQuiz(payload);
        showToast('Kuis berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchQuizzes(page);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan kuis', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await quizService.deleteQuiz(deleteTarget.id);
      showToast('Kuis berhasil dihapus');
      setDeleteTarget(null);
      fetchQuizzes(page);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus kuis', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (qz) => {
    try {
      if (qz.status === 'published') {
        await quizService.unpublishQuiz(qz.id);
        showToast('Kuis diubah menjadi Draft');
      } else {
        await quizService.publishQuiz(qz.id);
        showToast('Kuis berhasil dipublikasikan');
      }
      fetchQuizzes(page);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status kuis', 'error');
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
          <h1>Manajemen Kuis</h1>
          <p>Uji pemahaman remaja dengan membuat kuis pilihan ganda terintegrasi artikel</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Tambah Kuis</span>
        </button>
      </div>

      <div className="dash-panel">
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : quizzes.length === 0 ? (
          <div className="dash-empty">Belum ada kuis yang dibuat.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul Kuis</th>
                    <th>Materi Terkait</th>
                    <th>Durasi (Menit)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((qz) => (
                    <tr key={qz.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{qz.title}</div>
                        {qz.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                            {qz.description.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td>
                        {qz.article_title || (qz.article_id ? 'Materi Terkait' : 'Umum (Tidak ada)')}
                      </td>
                      <td>{qz.duration ? `${qz.duration} Menit` : 'Bebas'}</td>
                      <td>
                        <span className={`badge ${qz.status === 'published' ? 'badge-success' : 'badge-primary'}`}>
                          {qz.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Link
                            to={`/admin/quizzes/${qz.id}/results`}
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', borderColor: 'rgba(22, 163, 74, 0.4)' }}
                            title="Lihat hasil & nilai kuis peserta"
                          >
                            <IconChart size={14} />
                            <span>Hasil Nilai</span>
                          </Link>
                          <Link
                            to={`/admin/quizzes/${qz.id}/questions`}
                            className="btn btn-outline btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconBook size={14} />
                            <span>Kelola Soal</span>
                          </Link>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleTogglePublish(qz)}
                          >
                            {qz.status === 'published' ? 'Draftkan' : 'Publish'}
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(qz)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteTarget(qz)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentQuiz ? 'Edit Kuis' : 'Tambah Kuis Baru'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Judul Kuis *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Tes Pengetahuan Menikah Dini"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="article_id">Materi Edukasi Terkait</label>
            <select
              id="article_id"
              name="article_id"
              className="form-input"
              value={formData.article_id}
              onChange={handleInputChange}
            >
              <option value="">-- Umum (Tidak terikat artikel khusus) --</option>
              {articles.map((art) => (
                <option key={art.id} value={art.id}>{art.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="duration">Durasi Pengerjaan (Menit)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              className="form-input"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="Contoh: 15 (kosongkan jika tidak ada batas waktu)"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Deskripsi Singkat *</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Masukkan deskripsi kuis..."
              rows={4}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kuis"
        message={`Apakah Anda yakin ingin menghapus kuis "${deleteTarget?.title}" beserta semua butir soal dan opsinya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminQuizzes;
