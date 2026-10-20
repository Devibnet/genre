import React, { useState, useEffect, useRef, useCallback } from 'react';
import galleryService from '../../services/galleryService';
import Modal from '../../components/common/Modal';
import { IconImage, IconSparkles, IconUsers } from '../../components/common/Icons';
import './Gallery.css';

/* ── Local SVG Icons ── */
const IconCamera = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconExpand = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconChevLeft = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const IconChevRight = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const IconGrid = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconPhotoFilm = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

/* ── Scroll-reveal hook ── */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

/* ── Skeleton ── */
const GlSkeletonGrid = ({ count = 9 }) => (
  <div className="gl-bento-grid" aria-busy="true" aria-label="Memuat galeri">
    {Array.from({ length: count }).map((_, i) => (
      <div className="gl-bento-item gl-skeleton-item" key={i}
        style={{ '--item-index': i }}>
        <div className="gl-skeleton-inner" />
      </div>
    ))}
  </div>
);

/* ── Gallery Card ── */
const GalleryCard = ({ item, index, onOpen }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`gl-bento-item${visible ? ' gl-reveal' : ''}`}
      style={{ '--item-index': index }}
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      aria-label={`Buka foto: ${item.caption || 'Dokumentasi GenRe'}`}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
    >
      <div className="gl-bento-inner">
        <img
          src={item.image_url}
          alt={item.caption || 'Dokumentasi GenRe Buleleng'}
          loading="lazy"
          className="gl-bento-img"
        />
        <div className="gl-bento-overlay">
          <div className="gl-overlay-top">
            <span className="gl-expand-btn">
              <IconExpand size={14} />
              Lihat
            </span>
          </div>
          {item.caption && (
            <div className="gl-overlay-bottom">
              <p className="gl-overlay-caption">{item.caption}</p>
            </div>
          )}
        </div>
        <div className="gl-bento-shine" aria-hidden="true" />
      </div>
      {item.caption && (
        <div className="gl-bento-footer">
          <span className="gl-bento-footer-text">{item.caption}</span>
          <span className="gl-bento-footer-icon"><IconExpand size={12} /></span>
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const fetchGallery = async (p = 1) => {
    setLoading(true);
    try {
      const res = await galleryService.getPublicGallery({ page: p, per_page: 12 });
      setItems(res.data || []);
      setMeta(res.meta || {});
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(page); }, [page]);

  const totalPhotos = meta.total ?? items.length;

  return (
    <div className="gl-page">

      {/* ── HERO ── */}
      <section className="gl-hero" aria-label="Hero Galeri">
        <div className="gl-hero-bg" aria-hidden="true">
          <div className="gl-hero-grid" />
          <div className="gl-hero-orb gl-hero-orb-green" />
          <div className="gl-hero-orb gl-hero-orb-ochre" />
          <div className="gl-hero-filmstrip" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gl-film-hole" />
            ))}
          </div>
        </div>

        <div className="container">
          <div className="gl-hero-content">
            <h1 className="gl-hero-title">
              Galeri <span>Momen GenRe</span>
            </h1>

            <p className="gl-hero-desc">
              Dokumentasi momen-momen berharga, kolaborasi seru, dan pelaksanaan program kerja
              Forum GenRe Kabupaten Buleleng dalam mewujudkan remaja berencana.
            </p>

            {/* Hero stats */}
            <div className="gl-hero-stats">
              <div className="gl-hero-stat">
                <div className="gl-hs-icon"><IconPhotoFilm size={18} /></div>
                <div className="gl-hs-text">
                  <span className="gl-hs-val">{loading ? '—' : totalPhotos}</span>
                  <span className="gl-hs-lbl">Momen Terekam</span>
                </div>
              </div>
              <div className="gl-hs-divider" aria-hidden="true" />
              <div className="gl-hero-stat">
                <div className="gl-hs-icon"><IconUsers size={18} /></div>
                <div className="gl-hs-text">
                  <span className="gl-hs-val">Kompak</span>
                  <span className="gl-hs-lbl">Aksi Nyata</span>
                </div>
              </div>
              <div className="gl-hs-divider" aria-hidden="true" />
              <div className="gl-hero-stat">
                <div className="gl-hs-icon"><IconSparkles size={18} /></div>
                <div className="gl-hs-text">
                  <span className="gl-hs-val">Inspiratif</span>
                  <span className="gl-hs-lbl">Berdampak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="gl-content" aria-label="Galeri Foto">
        <div className="container">

          {/* Toolbar */}
          <div className="gl-toolbar">
            <div className="gl-toolbar-left">
              <span className="gl-toolbar-tag">Arsip Foto</span>
              <h2 className="gl-toolbar-title">Jelajahi Kegiatan Kami</h2>
            </div>
            {!loading && items.length > 0 && (
              <div className="gl-toolbar-right">
                <div className="gl-count-pill">
                  <IconPhotoFilm size={14} />
                  {items.length} foto ditampilkan
                </div>
              </div>
            )}
          </div>

          {/* States */}
          {loading ? (
            <GlSkeletonGrid count={9} />
          ) : items.length === 0 ? (
            <div className="gl-empty" role="status">
              <div className="gl-empty-icon-wrap"><IconImage size={34} /></div>
              <h3 className="gl-empty-title">Galeri Masih Kosong</h3>
              <p className="gl-empty-desc">
                Belum ada foto dokumentasi kegiatan yang ditambahkan saat ini.
              </p>
            </div>
          ) : (
            <>
              {/* Bento Grid */}
              <div className="gl-bento-grid" role="list" aria-label="Daftar Foto Dokumentasi">
                {items.map((item, i) => (
                  <GalleryCard key={item.id} item={item} index={i} onOpen={setActiveItem} />
                ))}
              </div>

              {/* Pagination */}
              {meta.total_pages > 1 && (
                <div className="gl-pagination">
                  <button className="gl-btn-pagination" disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)} aria-label="Halaman sebelumnya">
                    <IconChevLeft size={14} /> Sebelumnya
                  </button>
                  <div className="gl-page-dots">
                    {Array.from({ length: meta.total_pages }, (_, i) => (
                      <button key={i} className={`gl-page-dot${page === i + 1 ? ' active' : ''}`}
                        onClick={() => setPage(i + 1)} aria-label={`Halaman ${i + 1}`} />
                    ))}
                  </div>
                  <button className="gl-btn-pagination" disabled={page >= meta.total_pages}
                    onClick={() => setPage(p => p + 1)} aria-label="Halaman selanjutnya">
                    Selanjutnya <IconChevRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── MODAL GALERI ── */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={activeItem?.caption || 'Dokumentasi Kegiatan'}
        size="large"
      >
        {activeItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '8px 0' }}>
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              background: 'var(--slate-50)',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid var(--slate-100)'
            }}>
              <img
                src={activeItem.image_url}
                alt={activeItem.caption || 'Dokumentasi'}
                style={{
                  maxHeight: '68vh',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </div>
            {activeItem.caption && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '600px' }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>
                  <IconCamera size={18} />
                </span>
                <p style={{
                  color: 'var(--slate-700)',
                  fontSize: '0.96rem',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {activeItem.caption}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Gallery;
