import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import '../../pages/public/News.css';

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const NewsCard = ({ news }) => {
  const { title, slug, description, cover_url, event_date, photos = [] } = news;

  return (
    <article className="news-card">
      <div className="news-card-img-wrap">
        <img
          src={cover_url || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=60'}
          alt={title}
          loading="lazy"
        />
        <span className="news-card-badge-floating">Program GenRe</span>
        {photos && photos.length > 0 && (
          <span className="news-card-gallery-count" title={`${photos.length} Foto Dokumentasi`}>
            <PhotoIcon />
            <span>{photos.length} Foto</span>
          </span>
        )}
      </div>

      <div className="news-card-body">
        <div className="news-card-meta-row">
          <CalendarIcon />
          <span>{event_date ? formatDate(event_date) : 'Agenda Terlaksana'}</span>
        </div>

        <h3 className="news-card-title" title={title}>{title}</h3>
        <p className="news-card-desc">{description || 'Liputan agenda dan dokumentasi kegiatan aksi nyata Forum GenRe Kabupaten Buleleng.'}</p>

        <div className="news-card-footer">
          <Link to={`/berita/${slug}`} className="news-card-btn">
            <span>Baca Liputan</span>
            <span className="news-card-btn-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
