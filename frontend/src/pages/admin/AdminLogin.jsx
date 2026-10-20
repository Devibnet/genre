import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconLock, IconShieldCheck } from '../../components/common/Icons';
import './AdminLogin.css';

const AdminLogin = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Kredensial tidak valid. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-layout">
      {/* ── LEFT PANEL: Branding ── */}
      <div className="al-brand-panel">
        <div className="al-brand-bg"></div>
        <div className="al-brand-overlay"></div>
        <div className="al-brand-content">
          <Link to="/" className="al-back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Kembali ke Beranda
          </Link>
          
          <div className="al-brand-text">
            <div className="al-logo-icon">
              <IconShieldCheck size={36} />
            </div>
            <h1 className="al-title">GenRe Admin Portal</h1>
            <p className="al-desc">
              Sistem manajemen konten dan administrasi eksklusif untuk pengurus Forum GenRe Kabupaten Buleleng.
            </p>
          </div>

          <div className="al-brand-footer">
            <p>&copy; {new Date().getFullYear()} Forum GenRe Kab. Buleleng.<br/>Hak cipta dilindungi.</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="al-form-panel">
        <div className="al-form-wrapper animated-fade-in">
          <div className="al-form-header">
            <h2>Selamat Datang</h2>
            <p>Silakan masuk menggunakan kredensial admin Anda.</p>
          </div>

          {error && (
            <div className="al-alert al-alert-error" role="alert">
              <div className="al-alert-icon">!</div>
              <div className="al-alert-text">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="al-form">
            <div className="al-input-group">
              <label htmlFor="email">Alamat Email</label>
              <div className="al-input-wrapper">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@genrebuleleng.id"
                  autoComplete="email"
                  className={error ? 'has-error' : ''}
                />
              </div>
            </div>

            <div className="al-input-group">
              <div className="al-label-row">
                <label htmlFor="password">Kata Sandi</label>
              </div>
              <div className="al-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className={error ? 'has-error' : ''}
                />
                <button 
                  type="button" 
                  className="al-btn-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="al-btn-submit"
              disabled={submitting || loading}
            >
              <IconLock size={18} />
              {submitting ? 'Memverifikasi...' : 'Masuk ke Portal'}
            </button>
          </form>

          <div className="al-security-note">
            <IconShieldCheck size={16} />
            Sesi ini diamankan dengan enkripsi
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
