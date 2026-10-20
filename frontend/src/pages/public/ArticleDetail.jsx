import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import articleService from '../../services/articleService';
import { Spinner } from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import './PageCommon.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await articleService.getPublicArticleBySlug(slug);
        setArticle(data);
      } catch (err) {
        setError(err.message || 'Artikel tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) return <Spinner message="Memuat artikel..." />;
  if (error) {
    return (
      <div className="detail-container">
        <Link to="/edukasi" className="back-link">&larr; Kembali ke Pusat Edukasi</Link>
        <div className="error-state">
          <h3 className="error-state-title">Artikel Tidak Ditemukan</h3>
          <p className="error-state-desc">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Link to="/edukasi" className="back-link">&larr; Kembali ke Pusat Edukasi</Link>

      {article.cover_url && (
        <div className="detail-cover">
          <img src={article.cover_url} alt={article.title} />
        </div>
      )}

      <div className="detail-meta-row">
        <span className="badge badge-primary">Pusat Edukasi</span>
        {article.published_at && (
          <span style={{ color: 'var(--slate-600)', fontSize: '0.9rem', fontWeight: 500 }}>
            Dipublikasikan: {formatDate(article.published_at)}
          </span>
        )}
      </div>

      <h1 className="detail-title">{article.title}</h1>
      <p className="detail-description">{article.description}</p>

      <div className="detail-actions">
        {article.drive_url && (
          <a
            href={article.drive_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            Baca Artikel di Google Drive &rarr;
          </a>
        )}
        <Link to="/edukasi" className="btn btn-outline btn-lg">
          Kembali
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetail;
