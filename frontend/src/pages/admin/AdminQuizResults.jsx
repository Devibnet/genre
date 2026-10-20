import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconTrash, IconEye } from '../../components/common/Icons';
import './AdminQuizResults.css';

// Local SVG Icons
const IconArrowLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconUsers = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAward = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const IconChartBar = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconCheckCircle = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconDownload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconRefresh = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
);

const AdminQuizResults = () => {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuizData = useCallback(async () => {
    try {
      const quizData = await quizService.getAdminQuizById(quizId);
      setQuiz(quizData);
    } catch {
      // Handled silently or via main error
    }
  }, [quizId]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await quizService.getQuizResultStats(quizId);
      setStats(statsData);
    } catch {
      setStats(null);
    }
  }, [quizId]);

  const fetchResults = useCallback(async (p = 1, search = '') => {
    setLoading(true);
    try {
      const res = await quizService.getQuizResults(quizId, {
        page: p,
        per_page: 10,
        search: search.trim() || undefined,
      });
      setResults(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat hasil kuis peserta', 'error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizData();
    fetchStats();
  }, [fetchQuizData, fetchStats]);

  useEffect(() => {
    fetchResults(page, searchQuery);
  }, [fetchResults, page, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await quizService.deleteQuizSubmission(deleteTarget.id);
      showToast('Hasil pengerjaan peserta berhasil dihapus');
      setDeleteTarget(null);
      fetchResults(page, searchQuery);
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus data pengerjaan', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const headers = ['No', 'Nama Peserta', 'Skor Benar', 'Total Soal', 'Persentase (%)', 'Status', 'Waktu Submit'];
    const rows = results.map((item, idx) => {
      const pct = Number(item.percentage || 0);
      const status = pct >= 80 ? 'Sangat Memuaskan' : pct >= 60 ? 'Cukup Baik' : 'Perlu Belajar';
      const formattedDate = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
      return [
        idx + 1,
        `"${(item.participant_name || 'Peserta Mandiri').replace(/"/g, '""')}"`,
        item.score,
        item.total_questions,
        item.percentage,
        `"${status}"`,
        `"${formattedDate}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_Kuis_${quiz?.title ? quiz.title.replace(/\s+/g, '_') : 'GenRe'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh');
  };

  const formatIndoDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      {/* Top Breadcrumb */}
      <Link to="/admin/quizzes" className="qr-header-back">
        <IconArrowLeft size={16} />
        <span>Kembali ke Manajemen Kuis</span>
      </Link>

      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Hasil Nilai: {quiz?.title || 'Kuis'}</h1>
          <p>Rekap data perolehan skor dan rincian jawaban para peserta kuis</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline"
            onClick={() => { fetchResults(page, searchQuery); fetchStats(); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Muat Ulang"
          >
            <IconRefresh size={15} />
            <span>Segarkan</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <IconDownload size={16} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="qr-stats-grid">
        <div className="qr-stat-card">
          <div className="qr-stat-icon-wrap qr-stat-icon-blue">
            <IconUsers size={22} />
          </div>
          <div className="qr-stat-info">
            <span className="qr-stat-val">{stats ? stats.total_participants : '—'}</span>
            <span className="qr-stat-lbl">Total Peserta</span>
          </div>
        </div>

        <div className="qr-stat-card">
          <div className="qr-stat-icon-wrap qr-stat-icon-amber">
            <IconChartBar size={22} />
          </div>
          <div className="qr-stat-info">
            <span className="qr-stat-val">{stats ? `${stats.average_percentage}%` : '—'}</span>
            <span className="qr-stat-lbl">Rata-rata Skor</span>
          </div>
        </div>

        <div className="qr-stat-card">
          <div className="qr-stat-icon-wrap qr-stat-icon-green">
            <IconAward size={22} />
          </div>
          <div className="qr-stat-info">
            <span className="qr-stat-val">{stats ? `${stats.highest_percentage}%` : '—'}</span>
            <span className="qr-stat-lbl">Nilai Tertinggi</span>
          </div>
        </div>

        <div className="qr-stat-card">
          <div className="qr-stat-icon-wrap qr-stat-icon-purple">
            <IconCheckCircle size={22} />
          </div>
          <div className="qr-stat-info">
            <span className="qr-stat-val">{stats ? `${stats.pass_rate}%` : '—'}</span>
            <span className="qr-stat-lbl">Kelulusan (≥60%)</span>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="dash-panel">
        <div className="qr-controls-bar">
          <form onSubmit={handleSearchSubmit} className="qr-search-wrap">
            <span className="qr-search-icon"><IconSearch size={16} /></span>
            <input
              type="text"
              className="qr-search-input"
              placeholder="Cari nama peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '8px', padding: '2px 8px' }}
              >
                Reset
              </button>
            )}
          </form>

          <span style={{ fontSize: '0.86rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            {meta.total ? `Ditemukan ${meta.total} pengerjaan kuis` : ''}
          </span>
        </div>

        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : results.length === 0 ? (
          <div className="dash-empty">
            {searchQuery ? 'Tidak ada peserta yang cocok dengan pencarian.' : 'Belum ada peserta yang mengumpulkan kuis ini.'}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>No</th>
                    <th>Nama Peserta</th>
                    <th>Skor Benar</th>
                    <th>Persentase &amp; Status</th>
                    <th>Waktu Pengumpulan</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((sub, idx) => {
                    const rowNumber = (page - 1) * (meta.per_page || 10) + idx + 1;
                    const pct = Number(sub.percentage || 0);
                    const gradeClass = pct >= 80 ? 'qr-pct-good' : pct >= 60 ? 'qr-pct-mid' : 'qr-pct-low';
                    const badgeClass = pct >= 80 ? 'badge-success' : pct >= 60 ? 'badge-primary' : 'badge-danger';
                    const gradeLabel = pct >= 80 ? 'Sangat Baik' : pct >= 60 ? 'Cukup' : 'Perlu Belajar';
                    const initial = (sub.participant_name || 'P').charAt(0).toUpperCase();

                    return (
                      <tr key={sub.id}>
                        <td>{rowNumber}</td>
                        <td>
                          <div className="qr-participant-cell">
                            <div className="qr-avatar-badge">{initial}</div>
                            <div>
                              <strong style={{ color: 'var(--dark)' }}>{sub.participant_name || 'Peserta Mandiri'}</strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.96rem' }}>
                            {sub.score}
                          </span>
                          <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}> / {sub.total_questions} Soal</span>
                        </td>
                        <td>
                          <div className="qr-percentage-bar-wrap">
                            <div className="qr-pct-track">
                              <div className={`qr-pct-fill ${gradeClass}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{pct}%</span>
                            <span className={`badge ${badgeClass}`} style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                              {gradeLabel}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                          {formatIndoDate(sub.created_at)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => setSelectedSubmission(sub)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Lihat rincian jawaban peserta"
                            >
                              <IconEye size={14} />
                              <span>Rincian</span>
                            </button>
                            <button
                              className="btn btn-outline btn-xs"
                              style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => setDeleteTarget(sub)}
                              title="Hapus data hasil kuis ini"
                            >
                              <IconTrash size={14} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* Participant Answer Detail Modal */}
      <Modal
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title={`Rincian Jawaban: ${selectedSubmission?.participant_name || 'Peserta'}`}
        size="large"
      >
        {selectedSubmission && (
          <div>
            {/* Quick stats in modal */}
            <div className="qr-modal-summary-card">
              <div className="qr-modal-stat-item">
                <span className="qr-modal-stat-lbl">Nama Peserta</span>
                <span className="qr-modal-stat-val">{selectedSubmission.participant_name}</span>
              </div>
              <div className="qr-modal-stat-item">
                <span className="qr-modal-stat-lbl">Skor Akhir</span>
                <span className="qr-modal-stat-val" style={{ color: 'var(--primary)' }}>
                  {selectedSubmission.score} / {selectedSubmission.total_questions} ({selectedSubmission.percentage}%)
                </span>
              </div>
              <div className="qr-modal-stat-item">
                <span className="qr-modal-stat-lbl">Waktu Pengerjaan</span>
                <span className="qr-modal-stat-val" style={{ fontSize: '0.88rem' }}>
                  {formatIndoDate(selectedSubmission.created_at)}
                </span>
              </div>
            </div>

            {/* Questions breakdown */}
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '12px' }}>
              Daftar Butir Soal &amp; Jawaban Peserta
            </h4>

            <div className="qr-modal-review-list">
              {Array.isArray(selectedSubmission.answers_summary) && selectedSubmission.answers_summary.length > 0 ? (
                selectedSubmission.answers_summary.map((ans, idx) => {
                  const isCorrect = Boolean(ans.is_correct);
                  return (
                    <div
                      key={ans.question_id || idx}
                      className={`qr-modal-question-item ${isCorrect ? 'item-correct' : 'item-wrong'}`}
                    >
                      <div className="qr-modal-q-top">
                        <span className="qr-modal-q-num">Nomor {idx + 1}</span>
                        <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                          {isCorrect ? '✓ Benar' : '✗ Kurang Tepat'}
                        </span>
                      </div>

                      <p className="qr-modal-q-text">{ans.question || `Soal #${idx + 1}`}</p>

                      {ans.explanation && (
                        <div className="qr-modal-explanation">
                          <strong>Pembahasan:</strong> {ans.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-500)' }}>
                  Tidak ada rincian butir soal untuk submission ini.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedSubmission(null)}>
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Rekap Hasil Kuis"
        message={`Apakah Anda yakin ingin menghapus hasil pengerjaan kuis atas nama "${deleteTarget?.participant_name || 'Peserta'}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminQuizResults;
