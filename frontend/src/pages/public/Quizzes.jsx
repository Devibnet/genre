import { useState, useEffect, useMemo } from 'react';
import quizService from '../../services/quizService';
import QuizCard from '../../components/quizzes/QuizCard';
import { SkeletonCard } from '../../components/common/Loading';
import { IconSparkles, IconBook, IconTarget, IconSearch, IconRefresh } from '../../components/common/Icons';
import './PageCommon.css';
import './Quizzes.css';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDuration, setFilterDuration] = useState('all');

  const fetchQuizzes = async (p = 1) => {
    setLoading(true);
    try {
      const res = await quizService.getPublicQuizzes({ page: p, per_page: 12 });
      setQuizzes(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(page);
  }, [page]);

  // Client-side filtering for search and duration
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDuration =
        filterDuration === 'all' ||
        (filterDuration === 'short' && q.duration && q.duration <= 10) ||
        (filterDuration === 'medium' && q.duration && q.duration > 10 && q.duration <= 20) ||
        (filterDuration === 'free' && (!q.duration || q.duration === 0));

      return matchSearch && matchDuration;
    });
  }, [quizzes, searchQuery, filterDuration]);

  const totalPages = meta.total_pages || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="quiz-page">
      {/* Hero Section */}
      <section className="quiz-hero">
        <div className="quiz-hero-bg" aria-hidden="true">
          <div className="quiz-hero-orb quiz-hero-orb-green"></div>
          <div className="quiz-hero-orb quiz-hero-orb-ochre"></div>
          <div className="quiz-hero-grid-pattern"></div>
        </div>

        <div className="container">
          <div className="quiz-hero-content">

            <h1 className="quiz-hero-title">
              Kuis <span>GenRe</span>
            </h1>

            <p className="quiz-hero-desc">
              Asah wawasanmu seputar Kesehatan Reproduksi, Pendewasaan Usia Perkawinan, dan Perencanaan Masa Depan lewat modul kuis interaktif yang seru dan informatif.
            </p>

            {/* Quick Metrics Bar */}
            <div className="quiz-hero-stats">
              <div className="quiz-hero-stat-card">
                <div className="quiz-stat-icon-wrap icon-wrap-green">
                  <IconTarget size={20} />
                </div>
                <div className="quiz-stat-text">
                  <span className="quiz-stat-val">{meta.total ?? quizzes.length}</span>
                  <span className="quiz-stat-lbl">Modul Quiz</span>
                </div>
              </div>

              <div className="quiz-hero-stat-divider"></div>

              <div className="quiz-hero-stat-card">
                <div className="quiz-stat-icon-wrap icon-wrap-amber">
                  <IconBook size={20} />
                </div>
                <div className="quiz-stat-text">
                  <span className="quiz-stat-val">100%</span>
                  <span className="quiz-stat-lbl">Akses Gratis</span>
                </div>
              </div>

              <div className="quiz-hero-stat-divider"></div>

              <div className="quiz-hero-stat-card">
                <div className="quiz-stat-icon-wrap icon-wrap-emerald">
                  <IconSparkles size={20} />
                </div>
                <div className="quiz-stat-text">
                  <span className="quiz-stat-val">Seketika</span>
                  <span className="quiz-stat-lbl">Skor &amp; Pembahasan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container quiz-content">
        {/* Header & Filter Controls */}
        <div className="quiz-toolbar-card">
          <div className="quiz-toolbar-left">
            <span className="quiz-toolbar-tag">Pilih Modul</span>
            <h2 className="quiz-toolbar-title">Daftar Modul Quiz</h2>
          </div>

          <div className="quiz-toolbar-controls">
            {/* Search Input */}
            <div className="quiz-search-wrapper">
              <IconSearch size={16} className="quiz-search-icon" />
              <input
                type="text"
                className="quiz-search-input"
                placeholder="Cari topik quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="quiz-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Hapus pencarian"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Duration Filter Pills */}
            <div className="quiz-filter-pills">
              <button
                className={`quiz-filter-btn ${filterDuration === 'all' ? 'active' : ''}`}
                onClick={() => setFilterDuration('all')}
              >
                Semua
              </button>
              <button
                className={`quiz-filter-btn ${filterDuration === 'short' ? 'active' : ''}`}
                onClick={() => setFilterDuration('short')}
              >
                &le; 10 Menit
              </button>
              <button
                className={`quiz-filter-btn ${filterDuration === 'medium' ? 'active' : ''}`}
                onClick={() => setFilterDuration('medium')}
              >
                10-20 Menit
              </button>
              <button
                className={`quiz-filter-btn ${filterDuration === 'free' ? 'active' : ''}`}
                onClick={() => setFilterDuration('free')}
              >
                Bebas
              </button>
            </div>
          </div>
        </div>

        {/* Content Render */}
        {loading ? (
          <div className="quiz-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="quiz-empty-box">
            <div className="quiz-empty-icon-wrap">
              <IconBook size={36} color="var(--primary)" />
            </div>
            <h3 className="quiz-empty-title">
              {searchQuery || filterDuration !== 'all'
                ? 'Tidak ada quiz yang sesuai filter'
                : 'Belum Ada Quiz Tersedia'}
            </h3>
            <p className="quiz-empty-desc">
              {searchQuery || filterDuration !== 'all'
                ? 'Coba ganti kata kunci pencarian atau ubah filter durasi di atas.'
                : 'Modul quiz interaktif sedang dipersiapkan oleh tim konselor GenRe Buleleng.'}
            </p>
            {(searchQuery || filterDuration !== 'all') && (
              <button
                className="btn btn-outline btn-sm quiz-empty-reset"
                onClick={() => {
                  setSearchQuery('');
                  setFilterDuration('all');
                }}
              >
                <IconRefresh size={14} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="quiz-grid">
              {filteredQuizzes.map((q) => (
                <QuizCard key={q.id} quiz={q} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="quiz-pagination">
                <button
                  className="quiz-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Halaman sebelumnya"
                >
                  <span className="quiz-page-btn-arrow">&larr;</span>
                </button>
                <div className="quiz-page-numbers">
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      className={`quiz-page-num ${num === page ? 'quiz-page-num-active' : ''}`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  className="quiz-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Halaman berikutnya"
                >
                  <span className="quiz-page-btn-arrow">&rarr;</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Quizzes;
