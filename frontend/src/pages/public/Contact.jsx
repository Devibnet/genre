import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';
import settingsService from '../../services/settingsService';
import './Contact.css';

/* ─────────────────────────────────────────────
   SVG ICONS HELPERS
   ───────────────────────────────────────────── */
const IconMapPin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconInstagram = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconSend = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconLock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconCheckCircle = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconAlertCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
const Contact = () => {
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getPublicSettings();
        setSettings(data || {});
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanMessage = formData.message.trim();

    if (!cleanName || !cleanMessage) {
      setError('Nama dan pesan masukan wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await feedbackService.submitFeedback({
        name: cleanName,
        message: cleanMessage,
      });
      setSubmitted(true);
      setFormData({ name: '', message: '' });
    } catch (err) {
      setError(err.message || 'Gagal mengirim masukan. Silakan coba beberapa saat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="co-page">
      {/* ── HERO ── */}
      <section className="co-hero" aria-label="Hero Hubungi Kami">
        <div className="co-hero-bg" aria-hidden="true">
          <div className="co-hero-grid" />
          <div className="co-hero-orb co-hero-orb-green" />
          <div className="co-hero-orb co-hero-orb-ochre" />
        </div>

        <div className="container">
          <div className="co-hero-content">
            <h1 className="co-hero-title">
              Hubungi <span>GenRe Buleleng</span>
            </h1>

            <p className="co-hero-desc">
              Sampaikan pertanyaan, masukan, aspirasi, atau saran konstruktif kamu demi pengembangan Forum GenRe Buleleng.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="co-content" aria-label="Formulir Kontak">
        <div className="container">
          <div className="co-grid">

            {/* Left Column: Form Side (Dominant Asymmetric Placement) */}
            <div className="co-form-wrap">
              {submitted ? (
                <div className="co-form-card co-success-panel">
                  <div className="co-success-icon-wrap" aria-hidden="true">
                    <IconCheckCircle size={32} />
                  </div>
                  <h3 className="co-section-title">Masukan Terkirim</h3>
                  <p className="co-section-desc" style={{ margin: '0' }}>
                    Terima kasih atas aspirasi dan saran kamu. Feedback dari kamu sangat berharga bagi pengembangan organisasi Forum GenRe Buleleng.
                  </p>
                  <button
                    className="co-btn-submit"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', message: '' });
                    }}
                  >
                    Kirim Aspirasi Baru
                  </button>
                </div>
              ) : (
                <div className="co-form-card">
                  <h2 className="co-section-title">Kotak Aspirasi &amp; Saran</h2>
                  <p className="co-section-desc">
                    Sampaikan masukan secara langsung. Nama boleh menggunakan inisial/anonim demi menjaga kenyamanan bersama.
                  </p>

                  {error && (
                    <div className="co-error-banner" role="alert" style={{ marginBottom: '20px' }}>
                      <IconAlertCircle />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="co-form">
                    <div className="co-form-group">
                      <label className="co-form-label" htmlFor="feedback-name">Nama / Inisial *</label>
                      <input
                        type="text"
                        id="feedback-name"
                        name="name"
                        className="co-form-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Contoh: Budi, B.S., atau Anonim"
                      />
                    </div>

                    <div className="co-form-group">
                      <label className="co-form-label" htmlFor="feedback-message">Masukan &amp; Saran *</label>
                      <textarea
                        id="feedback-message"
                        name="message"
                        className="co-form-input"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        maxLength={5000}
                        placeholder="Tuliskan saran atau masukan kamu secara detail di sini..."
                        rows={6}
                      />
                    </div>

                    <div className="co-privacy-box">
                      <span className="co-privacy-icon" aria-hidden="true">
                        <IconLock size={16} />
                      </span>
                      <span>
                        Aspirasi kamu bersifat rahasia dan hanya dapat diakses oleh administrator resmi Forum GenRe Kabupaten Buleleng.
                      </span>
                    </div>

                    <button type="submit" className="co-btn-submit" disabled={submitting}>
                      <IconSend size={14} />
                      {submitting ? 'Mengirim...' : 'Kirim Masukan'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Info Stack Side */}
            <div className="co-info-stack">
              <div className="co-info-intro">
                <span className="co-toolbar-tag">Hubungi Kami</span>
                <h2 className="co-section-title">Informasi &amp; Layanan</h2>
              </div>

              <div className="co-info-card">
                {settings.address && (
                  <div className="co-item">
                    <div className="co-icon-box" aria-hidden="true">
                      <IconMapPin size={20} />
                    </div>
                    <div className="co-item-details">
                      <span className="co-label">Alamat Sekretariat</span>
                      <span className="co-value">{settings.address}</span>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <div className="co-item">
                    <div className="co-icon-box" aria-hidden="true">
                      <IconPhone size={20} />
                    </div>
                    <div className="co-item-details">
                      <span className="co-label">Telepon / WhatsApp</span>
                      <a href={`tel:${settings.phone}`} className="co-value co-link">
                        {settings.phone}
                        <IconArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {settings.email && (
                  <div className="co-item">
                    <div className="co-icon-box" aria-hidden="true">
                      <IconMail size={20} />
                    </div>
                    <div className="co-item-details">
                      <span className="co-label">Email Resmi</span>
                      <a href={`mailto:${settings.email}`} className="co-value co-link">
                        {settings.email}
                        <IconArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {settings.instagram && (
                  <div className="co-item">
                    <div className="co-icon-box" aria-hidden="true">
                      <IconInstagram size={20} />
                    </div>
                    <div className="co-item-details">
                      <span className="co-label">Instagram</span>
                      <a
                        href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="co-value co-link"
                      >
                        {settings.instagram}
                        <IconArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Dynamic Card - Operational Hours */}
              <div className="co-extra-card">
                <h3 className="co-extra-title">Jam Pelayanan Aspirasi</h3>
                <p className="co-extra-desc">
                  Administrator kami memantau pesan masuk secara berkala untuk segera merespon aspirasi Anda.
                </p>
                <div className="co-time-row">
                  <IconClock size={16} />
                  <span>Senin - Jumat | 08.00 - 16.00 WITA</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
