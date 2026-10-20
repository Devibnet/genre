import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import newsService from '../../services/newsService';
import { Spinner } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatDate';
import { IconBuilding, IconImage } from '../../components/common/Icons';
import './NewsDetail.css';

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const NewsDetail = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await newsService.getPublicNewsBySlug(slug);
        setNews(data);
      } catch (err) {
        setError(err.message || 'Berita tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [slug]);

  if (loading) return <Spinner message="Memuat liputan program kerja..." />;

  if (error) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-container">
          <Link to="/berita" className="news-detail-back-btn">&larr; Kembali ke Program Kerja</Link>
          <div className="error-state" style={{ background: 'var(--white)', padding: '40px 20px', borderRadius: '18px' }}>
            <h3 className="error-state-title">Program Kerja Tidak Ditemukan</h3>
            <p className="error-state-desc">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      <div className="news-detail-container">
        <Link to="/berita" className="news-detail-back-btn">
          &larr; Kembali ke Program Kerja
        </Link>

        <article className="news-detail-card">
          {news.cover_url && (
            <div className="news-detail-cover-frame">
              <img src={news.cover_url} alt={news.title} />
            </div>
          )}

          <div className="news-detail-meta-bar">
            <span className="news-detail-badge">
              <IconBuilding size={14} />
              <span>Program Kerja DPMDPPKB</span>
            </span>

            {news.event_date && (
              <span className="news-detail-date">
                <CalendarIcon />
                <span>Pelaksanaan: {formatDate(news.event_date)}</span>
              </span>
            )}
          </div>

          <h1 className="news-detail-title">{news.title}</h1>
          <div className="news-detail-body-text">{news.description}</div>

          {/* Photo Documentation Section */}
          {news.photos && news.photos.length > 0 && (
            <div className="news-detail-gallery-wrap">
              <h3 className="news-detail-gallery-title">
                <IconImage size={20} color="var(--primary)" />
                <span>Galeri Dokumentasi Lapangan ({news.photos.length} Foto)</span>
              </h3>

              <div className="news-detail-photos-grid">
                {news.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="news-detail-photo-card"
                    onClick={() => setActivePhoto(photo)}
                  >
                    <img src={photo.image_url} alt={photo.caption || 'Dokumentasi Lapangan'} />
                    <div className="news-detail-photo-overlay">
                      <span>{photo.caption || 'Klik untuk perbesar'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!activePhoto}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.caption || 'Dokumentasi Kegiatan'}
      >
        {activePhoto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <img
              src={activePhoto.image_url}
              alt={activePhoto.caption || 'Dokumentasi'}
              style={{ maxHeight: '68vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px' }}
            />
            {activePhoto.caption && (
              <p style={{ color: 'var(--slate-700)', textAlign: 'center', fontSize: '0.92rem', fontWeight: 600 }}>
                {activePhoto.caption}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsDetail;
