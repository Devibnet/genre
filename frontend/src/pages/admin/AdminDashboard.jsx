import React, { useState, useEffect } from 'react';
import articleService from '../../services/articleService';
import newsService from '../../services/newsService';
import quizService from '../../services/quizService';
import counselorService from '../../services/counselorService';
import feedbackService from '../../services/feedbackService';
import { Link } from 'react-router-dom';
import { Spinner } from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import './AdminDashboard.css';

const StatCard = ({ label, value, to }) => (
  <Link to={to} className="stat-card">
    <p className="stat-card-label">{label}</p>
    <h3 className="stat-card-value">{value}</h3>
    <span className="stat-card-arrow">&rarr;</span>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    articles: 0,
    news: 0,
    quizzes: 0,
    counselors: 0,
    feedbacks: 0,
  });
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [articles, news, quizzes, counselors, feedbacks] = await Promise.allSettled([
          articleService.getAdminArticles({ per_page: 1 }),
          newsService.getAdminNews({ per_page: 1 }),
          quizService.getAdminQuizzes({ per_page: 1 }),
          counselorService.getAdminCounselors({ per_page: 1 }),
          feedbackService.getAdminFeedback({ per_page: 5 }),
        ]);

        setStats({
          articles: articles.status === 'fulfilled' ? (articles.value.meta?.total || 0) : 0,
          news: news.status === 'fulfilled' ? (news.value.meta?.total || 0) : 0,
          quizzes: quizzes.status === 'fulfilled' ? (quizzes.value.meta?.total || 0) : 0,
          counselors: counselors.status === 'fulfilled' ? (counselors.value.meta?.total || 0) : 0,
          feedbacks: feedbacks.status === 'fulfilled' ? (feedbacks.value.meta?.total || 0) : 0,
        });
        setRecentFeedbacks(feedbacks.status === 'fulfilled' ? (feedbacks.value.data || []) : []);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner message="Memuat dashboard..." />;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Selamat datang di Panel Admin Forum GenRe Buleleng</p>
        </div>
      </div>

      <div className="stats-cards">
        <StatCard label="Total Artikel" value={stats.articles} to="/admin/articles" />
        <StatCard label="Program Kerja" value={stats.news} to="/admin/news" />
        <StatCard label="Total Quiz" value={stats.quizzes} to="/admin/quizzes" />
        <StatCard label="Total Konselor" value={stats.counselors} to="/admin/counselors" />
        <StatCard label="Masukan & Saran" value={stats.feedbacks} to="/admin/feedback" />
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dash-panel">
          <h2 className="dash-panel-title">Aksi Cepat</h2>
          <div className="quick-actions">
            <Link to="/admin/articles" className="quick-action-btn">Kelola Artikel</Link>
            <Link to="/admin/news" className="quick-action-btn">Tambah Berita</Link>
            <Link to="/admin/quizzes" className="quick-action-btn">Buat Quiz</Link>
            <Link to="/admin/counselors" className="quick-action-btn">Kelola Konselor</Link>
            <Link to="/admin/gallery" className="quick-action-btn">Upload Foto</Link>
            <Link to="/admin/settings" className="quick-action-btn">Pengaturan</Link>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">Masukan &amp; Saran Terbaru</h2>
            <Link to="/admin/feedback" className="dash-panel-link">Lihat Semua</Link>
          </div>
          {recentFeedbacks.length === 0 ? (
            <div className="dash-empty">Belum ada masukan atau saran.</div>
          ) : (
            <div className="feedback-list">
              {recentFeedbacks.map((fb) => (
                <div key={fb.id} className="feedback-item">
                  <div className="feedback-info">
                    <p className="feedback-name">{fb.name}</p>
                    <p className="feedback-preview">{fb.message}</p>
                  </div>
                  <span className="feedback-date">
                    {fb.created_at ? formatDate(fb.created_at) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
