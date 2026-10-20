import React, { useState, useEffect } from 'react';
import articleService from '../../services/articleService';
import ArticleCard from '../../components/articles/ArticleCard';
import { SkeletonGrid } from '../../components/common/Loading';
import './Articles.css';

const TOPICS = [
];

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchArticles = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await articleService.getPublicArticles({ page: p, per_page: 9, search: q || undefined });
      setArticles(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setArticles([]);
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
    setSearch(searchInput.trim());
  };

  const handleTopicClick = (topic) => {
    setSearchInput(topic);
    setPage(1);
    setSearch(topic);
  };

  const showFeatured = page === 1 && !search && articles.length > 0;
  const featuredArticle = showFeatured ? articles[0] : null;
  const gridArticles = showFeatured ? articles.slice(1) : articles;
  const totalArticles = meta.total ?? articles.length;

  return (
    <div className="edu-page">
      {/* Hero */}
      <section className="edu-hero">
        <div className="edu-hero-bg" aria-hidden="true">
          <div className="edu-hero-grid-pattern" />
          <div className="edu-hero-orb edu-hero-orb--1" />
          <div className="edu-hero-orb edu-hero-orb--2" />
          <div className="edu-hero-orb edu-hero-orb--3" />
        </div>
        <div className="container edu-hero-inner">
          <div className="edu-hero-text">
            <div className="edu-hero-badge">
              <span className="edu-hero-badge-dot" />
              Materi Resmi GenRe
            </div>
            <h1 className="edu-hero-title">
              Pusat <span>Edukasi</span>
            </h1>
            <p className="edu-hero-subtitle">
              Pengetahuan dan panduan seputar kesehatan remaja, perencanaan hidup, dan pengembangan diri — disusun untuk generasi muda Buleleng.
            </p>
          </div>
          <div className="edu-hero-stats">
            <div className="edu-hero-stat">
              <div className="edu-hero-stat-value">
                {loading ? '—' : totalArticles}
              </div>
              <div className="edu-hero-stat-label">Artikel Tersedia</div>
            </div>
            <div className="edu-hero-stat">
              <div className="edu-hero-stat-value">
                {TOPICS.length}<span>+</span>
              </div>
              <div className="edu-hero-stat-label">Topik Edukasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Topics */}
      <section className="edu-toolbar">
        <div className="container">
          <div className="edu-toolbar-panel">
            <form className="edu-search" onSubmit={handleSearch}>
              <div className="edu-search-input-wrap">
                <span className="edu-search-icon"><SearchIcon /></span>
                <input
                  type="text"
                  className="edu-search-input"
                  placeholder="Cari judul artikel edukasi..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary edu-search-btn">Cari</button>
            </form>
            <div className="edu-topics">
              <span className="edu-topics-label"></span>
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`edu-topic-chip${search === topic ? ' edu-topic-chip--active' : ''}`}
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </button>
              ))}
              {search && (
                <button
                  type="button"
                  className="edu-topic-chip"
                  onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="container edu-content">
        {!loading && articles.length > 0 && (
          <div className="edu-section-header">
            <h2 className="edu-section-title">
              {search ? <>Hasil pencarian: <span>"{search}"</span></> : <>Koleksi <span>Artikel</span></>}
            </h2>
            <span className="edu-section-count">
              {totalArticles} artikel ditemukan
            </span>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={9} />
        ) : articles.length === 0 ? (
          <div className="edu-empty">
            <div className="edu-empty-icon"><BookIcon /></div>
            <h3 className="edu-empty-title">Belum Ada Artikel Tersedia</h3>
            <p className="edu-empty-desc">
              {search
                ? `Tidak ditemukan artikel untuk "${search}". Coba kata kunci lain.`
                : 'Artikel edukasi akan segera hadir. Kunjungi kembali nanti.'}
            </p>
            {search && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              >
                Lihat Semua Artikel
              </button>
            )}
          </div>
        ) : (
          <>
            {featuredArticle && (
              <div className="edu-featured-wrap">
                <div className="edu-featured-label">Ayo kita belajar!!!</div>
                <ArticleCard article={featuredArticle} featured />
              </div>
            )}

            {gridArticles.length > 0 && (
              <div className="edu-grid">
                {gridArticles.map((art) => (
                  <div key={art.id} className="edu-grid-item">
                    <ArticleCard article={art} />
                  </div>
                ))}
              </div>
            )}

            {meta.total_pages > 1 && (
              <div className="edu-pagination">
                <button
                  type="button"
                  className="edu-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Sebelumnya
                </button>
                <div className="edu-page-indicator">
                  {Array.from({ length: meta.total_pages }, (_, i) => (
                    <span
                      key={i + 1}
                      className={`edu-page-dot${page === i + 1 ? ' edu-page-dot--active' : ''}`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="edu-page-text">Halaman {page} dari {meta.total_pages}</span>
                </div>
                <button
                  type="button"
                  className="edu-page-btn"
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Articles;
