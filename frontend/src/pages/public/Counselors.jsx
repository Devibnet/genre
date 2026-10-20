import React, { useState, useEffect } from 'react';
import counselorService from '../../services/counselorService';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import {
  IconUsers,
  IconShieldCheck,
  IconSparkles,
  IconChat,
  IconArrowRight,
  IconCheckCircle,
  IconLock
} from '../../components/common/Icons';
import './CounselorsPage.css';

/* Custom simple icons not in common Icons.jsx */
const IconCalendar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconWhatsApp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.518 5.829L.057 23.5a.5.5 0 0 0 .619.635l5.84-1.528A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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

const IconX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─────────────────────────────────────────────
   COUNSELOR CARD
   ───────────────────────────────────────────── */
const CpCounselorCard = ({ counselor, onChatClick }) => {
  const { name, age, photo_url, description, status } = counselor;
  const isInactive = status === 'inactive';

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'KS';

  return (
    <div className={`cp-card${isInactive ? ' cp-card-inactive' : ''}`}>
      {/* Photo */}
      <div className="cp-card-photo">
        {photo_url ? (
          <img src={photo_url} alt={name} loading="lazy" />
        ) : (
          <div className="cp-avatar-fallback" aria-label={`Inisial ${name}`}>
            {initials}
          </div>
        )}
        {isInactive && (
          <span className="cp-status-badge">Tidak Aktif</span>
        )}
      </div>

      {/* Body */}
      <div className="cp-card-body">
        <span className="cp-card-role">Konselor Sebaya</span>
        <h3 className="cp-card-name">{name}</h3>

        {age && (
          <div className="cp-card-age-row">
            <IconCalendar />
            <span>{age} Tahun</span>
          </div>
        )}

        <p className="cp-card-desc">
          {description || 'Konselor sebaya GenRe siap mendampingi dan mendengar cerita kamu dengan penuh empati dan kerahasiaan.'}
        </p>

        {!isInactive && (
          <div className="cp-card-footer">
            <button
              className="cp-card-btn"
              onClick={onChatClick}
              aria-label={`Mulai konseling dengan ${name}`}
            >
              <IconChat size={16} />
              Mulai Konseling
              <span className="cp-card-btn-arrow">
                <IconArrowRight size={14} />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SKELETON GRID
   ───────────────────────────────────────────── */
const CpSkeletonGrid = ({ count = 8 }) => (
  <div className="cp-skeleton-grid" aria-busy="true" aria-label="Memuat data konselor">
    {Array.from({ length: count }).map((_, i) => (
      <div className="cp-skeleton-card" key={i}>
        <div className="cp-skeleton-photo" />
        <div className="cp-skeleton-body">
          <div className="cp-skeleton-line cp-skeleton-sm" />
          <div className="cp-skeleton-line cp-skeleton-md" />
          <div className="cp-skeleton-line cp-skeleton-sm" />
          <div className="cp-skeleton-line cp-skeleton-full" />
          <div className="cp-skeleton-line cp-skeleton-lg" />
          <div className="cp-skeleton-line cp-skeleton-btn" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   COUNSELING MODAL
   ───────────────────────────────────────────── */
const CounselingModal = ({ counselor, onClose }) => {
  const [name, setName] = useState('');
  const [story, setStory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!counselor.whatsapp_number) {
      setError('Nomor WhatsApp konselor tidak tersedia. Silakan hubungi admin.');
      return;
    }
    if (!name.trim()) {
      setError('Nama / inisial tidak boleh kosong.');
      return;
    }
    if (!story.trim()) {
      setError('Cerita konseling tidak boleh kosong.');
      return;
    }

    const link = buildWhatsAppLink(
      counselor.whatsapp_number,
      name.trim(),
      story.trim(),
      counselor.name
    );

    if (!link) {
      setError('Nomor WhatsApp konselor tidak valid. Silakan hubungi admin.');
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="cp-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cp-modal-title"
    >
      <div className="cp-modal">
        <div className="cp-modal-bar" aria-hidden="true" />

        <div className="cp-modal-header">
          <div className="cp-modal-heading">
            <span className="cp-modal-eyebrow">Sesi Konseling</span>
            <h2 className="cp-modal-title" id="cp-modal-title">
              Bersama {counselor.name}
            </h2>
          </div>
          <button
            className="cp-modal-close"
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <IconX />
          </button>
        </div>

        <div className="cp-modal-body">
          <p className="cp-modal-info">
            Isi form di bawah — pesanmu akan langsung diarahkan ke WhatsApp konselor.
            Kamu boleh menggunakan nama samaran atau inisial.
          </p>

          {error && (
            <div className="cp-error" role="alert">
              <IconAlertCircle />
              {error}
            </div>
          )}

          <form className="cp-form" onSubmit={handleSubmit}>
            <div className="cp-form-group">
              <label className="cp-form-label" htmlFor="cp-counseling-name">
                Nama / Inisial *
              </label>
              <input
                id="cp-counseling-name"
                type="text"
                className="cp-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bunga, A.S., atau Anonim"
                maxLength={100}
                required
              />
            </div>

            <div className="cp-form-group">
              <label className="cp-form-label" htmlFor="cp-counseling-story">
                Cerita Konseling *
              </label>
              <textarea
                id="cp-counseling-story"
                className="cp-form-input"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tuliskan cerita atau permasalahan yang ingin kamu konsultasikan..."
                rows={5}
                required
              />
            </div>

            <div className="cp-privacy-note">
              <span className="cp-privacy-icon">
                <IconLock size={16} />
              </span>
              <span>
                Pesan kamu <strong>tidak disimpan</strong> ke database.
                Cerita langsung dikirim via WhatsApp konselor.
              </span>
            </div>

            <div className="cp-modal-actions">
              <button type="button" className="cp-btn-cancel" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="cp-btn-submit">
                <IconWhatsApp />
                Lanjut ke WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */
const Counselors = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      try {
        const res = await counselorService.getPublicCounselors();
        setCounselors(res.data || res || []);
      } catch {
        setCounselors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const activeCount = counselors.filter(c => c.status !== 'inactive').length;

  return (
    <div className="cp-page">
      {/* ── HERO ── */}
      <section className="cp-hero" aria-label="Hero halaman konselor">
        {/* Background layers */}
        <div className="cp-hero-bg" aria-hidden="true">
          <div className="cp-hero-grid" />
          <div className="cp-hero-orb cp-hero-orb-green" />
          <div className="cp-hero-orb cp-hero-orb-ochre" />
        </div>
        {/* Animated scanlines */}
        <div className="cp-hero-scanlines" aria-hidden="true" />
        {/* Floating particles */}
        <div className="cp-hero-particle" aria-hidden="true" />
        <div className="cp-hero-particle" aria-hidden="true" />
        <div className="cp-hero-particle" aria-hidden="true" />
        <div className="cp-hero-particle" aria-hidden="true" />

        <div className="container">
          <div className="cp-hero-content">
            {/* Eyebrow badge */}

            {/* Cinematic Title */}
            <h1 className="cp-hero-title">
              Konselor Sebaya
              <span>GenRe Buleleng</span>
            </h1>

            {/* Description */}
            <p className="cp-hero-desc">
              Tim konselor sebaya terlatih kami siap mendampingi dan mendengar cerita remaja
              Buleleng dengan aman, nyaman, dan penuh kerahasiaan.
            </p>

            {/* Glassmorphism stats bar */}
            <div className="cp-hero-stats">
              <div className="cp-hero-stat">
                <div className="cp-stat-icon cp-stat-icon-green">
                  <IconSparkles size={18} />
                </div>
                <div className="cp-stat-text">
                  <span className="cp-stat-val">Terlatih</span>
                  <span className="cp-stat-lbl">Bersertifikat</span>
                </div>
              </div>

              <div className="cp-stat-divider" aria-hidden="true" />

              <div className="cp-hero-stat">
                <div className="cp-stat-icon cp-stat-icon-amber">
                  <IconShieldCheck size={18} />
                </div>
                <div className="cp-stat-text">
                  <span className="cp-stat-val">100%</span>
                  <span className="cp-stat-lbl">Rahasia Terjaga</span>
                </div>
              </div>

              <div className="cp-stat-divider" aria-hidden="true" />

              <div className="cp-hero-stat">
                <div className="cp-stat-icon cp-stat-icon-teal">
                  <IconUsers size={18} />
                </div>
                <div className="cp-stat-text">
                  <span className="cp-stat-val">
                    {loading ? '—' : activeCount}
                  </span>
                  <span className="cp-stat-lbl">Konselor Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT (KEMBALI KE SIMPLE 4 COL GRID ORIGINAL) ── */}
      <section className="cp-content" aria-label="Daftar konselor">
        <div className="container">
          {/* Toolbar */}
          <div className="cp-toolbar">
            <div className="cp-toolbar-left">
              <span className="cp-toolbar-tag">Tim Konselor</span>
              <h2 className="cp-toolbar-title">Kenali Konselor Kami</h2>
            </div>
            {!loading && counselors.length > 0 && (
              <div className="cp-toolbar-count">
                <IconUsers size={14} />
                {counselors.length} Konselor Terdaftar
              </div>
            )}
          </div>

          {/* Content states */}
          {loading ? (
            <CpSkeletonGrid count={8} />
          ) : counselors.length === 0 ? (
            <div className="cp-empty" role="status">
              <div className="cp-empty-icon-wrap">
                <IconUsers size={34} />
              </div>
              <h3 className="cp-empty-title">Belum Ada Konselor Terdaftar</h3>
              <p className="cp-empty-desc">
                Data tim konselor sebaya akan segera ditambahkan. Pantau terus halaman ini!
              </p>
            </div>
          ) : (
            <div className="cp-grid" role="list" aria-label="Daftar konselor sebaya">
              {counselors.map((c) => (
                <div key={c.id} className="cp-card-col" role="listitem">
                  <CpCounselorCard
                    counselor={c}
                    onChatClick={() => setSelectedCounselor(c)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL ── */}
      {selectedCounselor && (
        <CounselingModal
          counselor={selectedCounselor}
          onClose={() => setSelectedCounselor(null)}
        />
      )}
    </div>
  );
};

export default Counselors;
