import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeService from '../../services/homeService';
import ArticleCard from '../../components/articles/ArticleCard';
import NewsCard from '../../components/news/NewsCard';
import GalleryCard from '../../components/gallery/GalleryCard';
import CounselorCard from '../../components/counselors/CounselorCard';
import AutoSlider from '../../components/common/AutoSlider';
import Modal from '../../components/common/Modal';
import {
  IconBook,
  IconChat,
  IconMegaphone,
  IconTarget,
  IconSprout,
  IconShieldCheck,
  IconUsers,
  IconSparkles,
  IconBuilding,
  IconArrowRight,
  IconCheckCircle,
  IconHeartHandshake,
} from '../../components/common/Icons';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import { Spinner } from '../../components/common/Loading';
import './Home.css';

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Counseling Modal State
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [userName, setUserName] = useState('');
  const [userStory, setUserStory] = useState('');
  const [modalError, setModalError] = useState('');

  // Gallery Lightbox State
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const homeData = await homeService.getHomeData();
        setData(homeData);
      } catch (err) {
        setError(err.message || 'Gagal memuat data beranda.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleOpenCounseling = (counselor) => {
    setSelectedCounselor(counselor);
    setUserName('');
    setUserStory('');
    setModalError('');
  };

  const handleStartCounseling = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userStory.trim()) {
      setModalError('Semua kolom wajib diisi.');
      return;
    }
    const link = buildWhatsAppLink(
      selectedCounselor.whatsapp_number,
      userName.trim(),
      userStory.trim(),
      selectedCounselor.name
    );
    window.open(link, '_blank', 'noopener,noreferrer');
    setSelectedCounselor(null);
  };

  if (loading) return <Spinner message="Memuat beranda GenRe Buleleng..." />;
  if (error) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="error-state">
          <h3 className="error-state-title">Terjadi Kendala</h3>
          <p className="error-state-desc">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Halaman</button>
        </div>
      </div>
    );
  }

  const { settings, featured_articles, latest_news, featured_gallery, featured_counselors } = data;

  const featurePrograms = [
    {
      id: 'edu',
      num: '01',
      title: 'Pusat Edukasi Remaja',
      category: 'Edukasi & Modul',
      description: 'Modul resmi kesehatan reproduksi, pendewasaan usia perkawinan (PUP), serta artikel edukasi remaja.',
      link: '/edukasi',
      btnText: 'Pelajari Modul',
      icon: <IconBook size={28} color="#ffffff" />
    },
    {
      id: 'counselor',
      num: '02',
      title: 'Konseling Sebaya Privat',
      category: 'Layanan Utama',
      description: 'Ruang bercerita dan konsultasi tertutup bersama konselor sebaya Forum GenRe Buleleng yang ramah dan terlatih.',
      link: '/konselor',
      btnText: 'Mulai Konseling',
      icon: <IconChat size={28} color="#ffffff" />
    },
    {
      id: 'news',
      num: '03',
      title: 'Program Kerja & Aksi Nyata',
      category: 'Aktivitas & Berita',
      description: 'Liputan kegiatan sosialisasi sekolah, aksi nyata pengabdian masyarakat, dan agenda Forum GenRe Buleleng.',
      link: '/berita',
      btnText: 'Lihat Liputan Kegiatan',
      icon: <IconMegaphone size={28} color="#ffffff" />
    },
    {
      id: 'quiz',
      num: '04',
      title: 'Quiz Pemahaman Remaja',
      category: 'Uji Pengetahuan',
      description: 'Asah pengetahuan seputar Triad KRR, kesehatan reproduksi, serta perencanaan masa depan dengan quiz seru.',
      link: '/quiz',
      btnText: 'Mulai Quiz',
      icon: <IconTarget size={28} color="#ffffff" />
    },
  ];

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span>Official Portal Forum GenRe Buleleng</span>
            </div>
            <h1 className="hero-title">
              Generasi Berencana, <span className="hero-title-accent">Buleleng Berkarya</span>
            </h1>
            <p className="hero-subtitle">
              Ruang resmi dan edukatif bagi remaja Kabupaten Buleleng untuk bertumbuh, berbagi cerita melalui konseling sebaya yang aman dan privat, serta merencanakan masa depan yang cerah.
            </p>
            <div className="hero-actions">
              <Link to="/konselor" className="btn btn-primary btn-lg hero-btn-main">
                <IconChat size={18} />
                <span>Konseling Sebaya</span>
                <span className="btn-arrow"><IconArrowRight size={18} /></span>
              </Link>
              <Link to="/edukasi" className="btn btn-outline btn-lg hero-btn-sec">
                <IconBook size={18} />
                <span>Pusat Edukasi</span>
              </Link>
            </div>

            {/* Quick Trust Highlights */}
            <div className="hero-trust-bar">
              <div className="trust-item">
                <IconShieldCheck size={16} color="var(--primary)" />
                <span>100% Privat &amp; Aman</span>
              </div>
              <div className="trust-dot"></div>
              <div className="trust-item">
                <IconUsers size={16} color="var(--primary)" />
                <span>Konselor Bersertifikasi</span>
              </div>
              <div className="trust-dot"></div>
              <div className="trust-item">
                <IconBuilding size={16} color="var(--primary)" />
                <span>Naungan DPMDPPKB</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-img-wrapper">
              <div className="hero-img-frame">
                <img
                  src={settings?.logo_url || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=60'}
                  alt="Logo GenRe Buleleng"
                  className="hero-img"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar Section */}
      <section className="stats-section container">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-num">50+</span>
            <span className="stat-label">Konselor Sebaya</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">100+</span>
            <span className="stat-label">Modul &amp; Artikel</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-num">1.000+</span>
            <span className="stat-label">Remaja Terjangkau</span>
          </div>
        </div>
      </section>

      {/* Perkenalan GenRe (Institutional Editorial Two-Column) */}
      <section className="section intro-section">
        <div className="container intro-grid">
          <div className="intro-visual">
            <div className="intro-video-wrapper">
              <iframe
                className="intro-video-iframe"
                src="https://www.youtube.com/embed/E6GcpiuJI3I?si=xvOtiyq-1scpc3Co"
                title="Video Profil Forum GenRe Kabupaten Buleleng"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
              <div className="intro-floating-tag">
                <IconBuilding size={16} />
                <span>Naungan DPMDPPKB Kab. Buleleng</span>
              </div>
            </div>
          </div>

          <div className="intro-content">
            <div className="intro-header">
              <span className="section-tagline">Tentang Organisasi</span>
              <h2 className="section-title">Wadah Pembinaan Remaja <span>Kabupaten Buleleng</span></h2>
            </div>
            
            <p className="intro-text">
              Forum GenRe Kabupaten Buleleng adalah wadah kepemudaan resmi di bawah naungan <strong>DPMDPPKB Kabupaten Buleleng</strong> yang mendampingi remaja merencanakan masa depan sehat, cerdas, dan ceria.
            </p>

            {/* 3 Core Pillars Cards */}
            <div className="intro-pillars-grid">
              <div className="intro-pillar-card">
                <div className="pillar-card-icon pillar-icon-pup">
                  <IconHeartHandshake size={20} />
                </div>
                <div className="pillar-card-body">
                  <div className="pillar-card-head">
                    <h5 className="pillar-card-title">Pendewasaan Usia Perkawinan</h5>
                    <span className="pillar-chip">PUP</span>
                  </div>
                  <p className="pillar-card-desc">
                    Perencanaan usia ideal menikah (minimal 21 tahun untuk perempuan &amp; 25 tahun untuk laki-laki).
                  </p>
                </div>
              </div>

              <div className="intro-pillar-card">
                <div className="pillar-card-icon pillar-icon-krr">
                  <IconShieldCheck size={20} />
                </div>
                <div className="pillar-card-body">
                  <div className="pillar-card-head">
                    <h5 className="pillar-card-title">Kesehatan Reproduksi Remaja</h5>
                    <span className="pillar-chip">KRR</span>
                  </div>
                  <p className="pillar-card-desc">
                    Edukasi pubertas sehat, anatomi biologis, kebersihan organ reproduksi, dan pencegahan anemia.
                  </p>
                </div>
              </div>

              <div className="intro-pillar-card">
                <div className="pillar-card-icon pillar-icon-triad">
                  <IconTarget size={20} />
                </div>
                <div className="pillar-card-body">
                  <div className="pillar-card-head">
                    <h5 className="pillar-card-title">Pencegahan Triad KRR</h5>
                    <span className="pillar-chip">Triad KRR</span>
                  </div>
                  <p className="pillar-card-desc">
                    Komitmen menjauhi 3 risiko utama remaja: Seks Pranikah, Penyalahgunaan Napza, dan Penularan HIV/AIDS.
                  </p>
                </div>
              </div>
            </div>

            <div className="intro-footer-action">
              <Link to="/kontak" className="btn btn-primary intro-btn">
                <span>Hubungi Organisasi</span>
                <span className="btn-arrow"><IconArrowRight size={16} /></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Animated Slider */}
      <section className="section features-section">
        <div className="container">
          <div className="section-head-bar">
            <div>
              <span className="section-tagline">Layanan &amp; Fitur Unggulan</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Program <span>Forum GenRe</span></h2>
            </div>
            <Link to="/berita" className="btn btn-outline btn-sm">Jelajahi Semua</Link>
          </div>

          <AutoSlider
            items={featurePrograms}
            itemsPerView={{ desktop: 3, tablet: 2, mobile: 1 }}
            autoSlideInterval={4500}
            renderItem={(prog) => (
              <Link to={prog.link} className={`prog-card prog-card--${prog.id}`}>
                <div className="prog-card-visual">
                  <span className="prog-card-num">{prog.num}</span>
                  <div className="prog-card-icon-ring">
                    {prog.icon}
                  </div>
                  <span className="prog-card-cat">{prog.category}</span>
                </div>
                <div className="prog-card-body">
                  <h3 className="prog-card-title">{prog.title}</h3>
                  <p className="prog-card-desc">{prog.description}</p>
                  <div className="prog-card-cta">
                    <span>{prog.btnText}</span>
                    <span className="prog-card-arrow"><IconArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            )}
          />
        </div>
      </section>

      {/* Latest Program / News */}
      {latest_news && latest_news.length > 0 && (
        <section className="section home-news">
          <div className="container">
            <div className="section-head-bar">
              <div>
                <span className="section-tagline">Dokumentasi Program</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Program Kerja <span>Terbaru</span></h2>
              </div>
              <Link to="/berita" className="btn btn-outline btn-sm">Lihat Semua Program</Link>
            </div>
            <AutoSlider
              items={latest_news}
              itemsPerView={{ desktop: 3, tablet: 2, mobile: 1 }}
              autoSlideInterval={4500}
              renderItem={(item) => <NewsCard news={item} />}
            />
          </div>
        </section>
      )}

      {/* Featured Articles Section */}
      {featured_articles && featured_articles.length > 0 && (
        <section className="section home-articles">
          <div className="container">
            <div className="section-head-bar">
              <div>
                <span className="section-tagline">Pusat Informasi</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Artikel <span>Edukasi</span></h2>
              </div>
              <Link to="/edukasi" className="btn btn-outline btn-sm">Lihat Semua Artikel</Link>
            </div>
            <AutoSlider
              items={featured_articles}
              itemsPerView={{ desktop: 3, tablet: 2, mobile: 1 }}
              autoSlideInterval={5000}
              renderItem={(art) => <ArticleCard article={art} />}
            />
          </div>
        </section>
      )}

      {/* Featured Counselors Section */}
      {featured_counselors && featured_counselors.length > 0 && (
        <section className="section home-counselors">
          <div className="container">
            <div className="section-head-bar">
              <div>
                <span className="section-tagline">Tim Konselor</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Konselor Sebaya <span>Siap Membantu</span></h2>
              </div>
              <Link to="/konselor" className="btn btn-outline btn-sm">Lihat Semua Konselor</Link>
            </div>
            <AutoSlider
              items={featured_counselors}
              itemsPerView={{ desktop: 4, tablet: 2, mobile: 1 }}
              autoSlideInterval={4000}
              renderItem={(c) => (
                <CounselorCard counselor={c} onChatClick={() => handleOpenCounseling(c)} />
              )}
            />
          </div>
        </section>
      )}

      {/* Featured Gallery Section */}
      {featured_gallery && featured_gallery.length > 0 && (
        <section className="section home-gallery">
          <div className="container">
            <div className="section-head-bar">
              <div>
                <span className="section-tagline">Dokumentasi Foto</span>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Galeri <span>Kegiatan</span></h2>
              </div>
              <Link to="/galeri" className="btn btn-outline btn-sm">Lihat Galeri Lengkap</Link>
            </div>
            <AutoSlider
              items={featured_gallery}
              itemsPerView={{ desktop: 4, tablet: 2, mobile: 1 }}
              autoSlideInterval={3800}
              renderItem={(photo) => (
                <GalleryCard item={photo} onClick={() => setActivePhoto(photo)} />
              )}
            />
          </div>
        </section>
      )}

      {/* Call to Action CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Butuh Teman Cerita atau Bimbingan?</h2>
            <p>Sampaikan cerita atau pertanyaanmu secara tertutup bersama konselor sebaya Forum GenRe Kabupaten Buleleng.</p>
            <Link to="/konselor" className="btn btn-accent btn-lg cta-btn">
              <span>Mulai Konseling Sekarang</span>
              <span className="btn-arrow"><IconArrowRight size={18} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Counseling Intake Modal */}
      <Modal
        isOpen={!!selectedCounselor}
        onClose={() => setSelectedCounselor(null)}
        title={`Konseling bersama Kak ${selectedCounselor?.name}`}
      >
        <form onSubmit={handleStartCounseling} className="counseling-form">
          {modalError && <div className="badge badge-error" style={{ marginBottom: '12px', width: '100%' }}>{modalError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="user-name">Nama / Inisial *</label>
            <input
              id="user-name"
              type="text"
              className="form-input"
              placeholder="Contoh: Bunga atau Inisial A"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="user-story">Cerita Konseling *</label>
            <textarea
              id="user-story"
              className="form-textarea"
              placeholder="Tuliskan hal yang ingin kamu konsultasikan..."
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              required
              rows={5}
            ></textarea>
          </div>
          <p className="form-note">
            Pesan kamu tidak disimpan di database. Pesan akan langsung diteruskan ke WhatsApp konselor.
          </p>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
            Lanjut ke WhatsApp &rarr;
          </button>
        </form>
      </Modal>

      {/* Gallery Lightbox Modal */}
      <Modal
        isOpen={!!activePhoto}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.caption || 'Dokumentasi Kegiatan'}
      >
        {activePhoto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <img
              src={activePhoto.image_url}
              alt={activePhoto.caption || 'Foto Galeri'}
              style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
            />
            <p style={{ color: 'var(--slate-700)', textAlign: 'center', fontSize: '0.95rem' }}>
              {activePhoto.caption || 'Dokumentasi Forum GenRe Buleleng'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
