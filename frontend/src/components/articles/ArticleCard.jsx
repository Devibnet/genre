import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import './ArticleCard.css';

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const ArticleCard = ({ article, featured = false }) => {
  const { title, slug, description, cover_url, published_at } = article;
  const fallbackImg = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';

  return (
    <article className={`edu-card${featured ? ' edu-card--featured' : ''}`}>
      <Link to={`/edukasi/${slug}`} className="edu-card-link">
        <div className="edu-card-media">
          <img src={cover_url || fallbackImg} alt={title} loading="lazy" />
          <div className="edu-card-media-overlay" aria-hidden="true" />
          {!featured && <span className="edu-card-tag">Edukasi</span>}
          {!featured && (
            <span className="edu-card-read-hint">
              Baca sekarang <ArrowIcon />
            </span>
          )}
        </div>
        <div className="edu-card-body">
          {featured && <span className="edu-card-tag">Artikel Terbaru</span>}
          {published_at && (
            <div className="edu-card-meta">
              <span className="edu-card-meta-dot" aria-hidden="true" />
              {formatDate(published_at)}
            </div>
          )}
          <h3 className="edu-card-title">{title}</h3>
          {description && <p className="edu-card-desc">{description}</p>}
          <div className="edu-card-footer">
            <span className="edu-card-cta">
              Baca Artikel <ArrowIcon />
            </span>
            {!featured && <span className="edu-card-accent-bar" aria-hidden="true" />}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;
