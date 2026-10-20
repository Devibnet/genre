import React, { useState, useEffect } from 'react';
import newsService from '../../services/newsService';
import NewsCard from '../../components/news/NewsCard';
import { SkeletonCard } from '../../components/common/Loading';
import { IconMegaphone, IconSearch, IconRefresh, IconUsers, IconBuilding } from '../../components/common/Icons';
import './PageCommon.css';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchNews = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const res = await newsService.getPublicNews({ page: p, per_page: 9, search: q || undefined });
      setNews(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setNews([]);
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

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const totalPages = meta.total_pages || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="news-hero-bg" aria-hidden="true">
          <div className="news-hero-orb news-hero-orb-green"></div>
          <div className="news-hero-orb news-hero-orb-ochre"></div>
          <div className="news-hero-grid-pattern"></div>
        </div>

        <div className="container">
          <div className="news-hero-content">

            <h1 className="news-hero-title">
              Program Kerja &amp; <span>Liputan GenRe</span>
            </h1>

            <p className="news-hero-desc">
              Jejak langkah pengabdian, sosialisasi edukatif, konseling komunitas, dan kolaborasi kepemudaan Forum GenRe Kabupaten Buleleng bersama DPMDPPKB.
            </p>

            {/* Quick Metrics Bar */}
            <div className="news-hero-stats">
              <div className="news-hero-stat-card">
                <div className="news-stat-icon-wrap" style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' }}>
                  <IconMegaphone size={20} />
                </div>
                <div className="news-stat-text">
                  <span className="news-stat-val">{meta.total ?? news.length}</span>
                  <span className="news-stat-lbl">Kegiatan Terpublikasi</span>
                </div>
              </div>

              <div className="news-hero-stat-divider"></div>

              <div className="news-hero-stat-card">
                <div className="news-stat-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                  <IconBuilding size={20} />
                </div>
                <div className="news-stat-text">
                  <span className="news-stat-val">9 Kecamatan</span>
                  <span className="news-stat-lbl">Jangkauan Buleleng</span>
                </div>
              </div>

              <div className="news-hero-stat-divider"></div>

              <div className="news-hero-stat-card">
                <div className="news-stat-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                  <IconUsers size={20} />
                </div>
                <div className="news-stat-text">
                  <span className="news-stat-val">Sebaya</span>
                  <span className="news-stat-lbl">Gerakan Edukasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container news-content">
        {/* Header & Filter Controls */}
        <div className="news-toolbar-card">
          <div className="news-toolbar-left">
            <span className="news-toolbar-tag">Arsip Dokumentasi</span>
            <h2 className="news-toolbar-title">Daftar Agenda &amp; Program Kerja</h2>
          </div>

          <form className="news-toolbar-controls" onSubmit={handleSearch}>
            <div className="news-search-wrapper">
              <IconSearch size={16} className="news-search-icon" />
              <input
                type="text"
                className="news-search-input"
                placeholder="Cari program kerja atau judul liputan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="news-search-clear"
                  onClick={handleClearSearch}
                  title="Hapus pencarian"
                >
                  &times;
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '9px 18px', borderRadius: '999px' }}>
              Cari
            </button>
          </form>
        </div>

        {/* Content Render */}
        {loading ? (
          <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="news-empty-box">
            <div className="news-empty-icon-wrap">
              <IconMegaphone size={36} color="var(--primary)" />
            </div>
            <h3 className="news-empty-title">
              {search ? 'Tidak Ada Program Kerja yang Cocok' : 'Belum Ada Program Kerja Tersedia'}
            </h3>
            <p className="news-empty-desc">
              {search
                ? `Tidak ditemukan liputan kegiatan dengan kata kunci "${search}".`
                : 'Dokumentasi agenda kegiatan dan liputan program kerja terbaru akan dipublikasikan di sini.'}
            </p>
            {search && (
              <button
                type="button"
                className="btn btn-outline btn-sm news-empty-reset"
                onClick={handleClearSearch}
              >
                <IconRefresh size={14} />
                <span>Reset Pencarian</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="news-grid">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="news-pagination">
                <button
                  className="news-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Halaman sebelumnya"
                >
                  <span className="news-page-btn-arrow">&larr;</span>
                </button>
                <div className="news-page-numbers">
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      className={`news-page-num ${num === page ? 'news-page-num-active' : ''}`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  className="news-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Halaman berikutnya"
                >
                  <span className="news-page-btn-arrow">&rarr;</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default News;
