import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import settingsService from '../../services/settingsService';
import { IconHeartHandshake, IconArrowUpRight } from '../common/Icons';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('GenRe Buleleng');
  const location = useLocation();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        if (settings) {
          setLogoUrl(settings.logo_url || '');
          setSiteName(settings.site_name || 'GenRe Buleleng');
        }
      } catch (err) {
        console.error('Failed to load settings logo:', err);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  const toggleMenu = () => {
    const next = !isOpen;
    setIsOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Pusat Edukasi', path: '/edukasi' },
    { name: 'Quiz', path: '/quiz' },
    { name: 'Program Kerja', path: '/berita' },
    { name: 'Konselor Sebaya', path: '/konselor' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <header className={`nb-header ${scrolled ? 'nb-scrolled' : ''}`}>
      <div className="nb-container container">
        {/* Brand */}
        <Link to="/" className="nb-brand" aria-label="Beranda GenRe Buleleng">
          <div className="nb-logo-wrapper">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="nb-logo-img" />
            ) : (
              <div className="nb-logo-badge">G</div>
            )}
          </div>
          <div className="nb-brand-meta">
            <span className="nb-brand-title">GenRe <span>Buleleng</span></span>
            <span className="nb-brand-tagline">Forum Generasi Berencana</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="nb-nav-desktop" aria-label="Navigasi Utama">
          <ul className="nb-nav-list">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="nb-nav-item">
                  <Link
                    to={link.path}
                    className={`nb-nav-link ${isActive ? 'nb-active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div className="nb-actions">
          <Link to="/konselor" className="nb-cta-btn">
            <IconHeartHandshake size={16} />
            <span className="nb-cta-text">Konseling Sebaya</span>
            <IconArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            className={`nb-toggle-btn ${isOpen ? 'nb-toggle-active' : ''}`}
            onClick={toggleMenu}
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isOpen}
          >
            <span className="nb-toggle-bar" />
            <span className="nb-toggle-bar" />
            <span className="nb-toggle-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="nb-mobile-backdrop" onClick={toggleMenu} aria-hidden="true" />
      )}

      {/* Mobile Menu — clean drop-down */}
      <nav className={`nb-mobile-menu ${isOpen ? 'nb-menu-open' : ''}`} aria-label="Menu Seluler">
        <ul className="nb-mobile-list">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nb-mobile-link ${isActive ? 'nb-mobile-active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="nb-mobile-divider" />
        <Link to="/konselor" className="nb-mobile-cta">
          <IconHeartHandshake size={16} />
          Konseling Sebaya
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
