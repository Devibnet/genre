import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import settingsService from '../../services/settingsService';
import { 
  IconMapPin, 
  IconPhone, 
  IconMail, 
  IconInstagram, 
  IconFacebook, 
  IconTikTok 
} from '../common/Icons';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getPublicSettings();
        setSettings(data);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (err) {
        console.error('Failed to load settings in footer:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          {/* Brand & Tentang */}
          <div className="footer-block footer-brand-block">
            <Link to="/" className="footer-brand">
              {logoUrl ? (
                <img src={logoUrl} alt="GenRe Buleleng" className="footer-logo-img" />
              ) : (
                <div className="footer-brand-emblem">G</div>
              )}
              <div className="footer-brand-info">
                <span className="footer-brand-title">GenRe Buleleng</span>
                <span className="footer-brand-sub">Forum Generasi Berencana</span>
              </div>
            </Link>
            
            <p className="footer-about">
              {settings?.description || 
                'Wadah pembinaan, edukasi, dan konseling remaja Kabupaten Buleleng di bawah naungan DP2KBP3A Kabupaten Buleleng untuk mewujudkan generasi muda yang sehat, cerdas, dan berencana.'}
            </p>

            {/* Social Media */}
            <div className="footer-social-section">
              <span className="footer-social-heading">Ikuti Kami</span>
              <div className="footer-social-icons">
                {settings?.instagram_url ? (
                  <a 
                    href={settings.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-btn"
                    title="Instagram GenRe Buleleng"
                    aria-label="Instagram"
                  >
                    <IconInstagram size={18} />
                  </a>
                ) : (
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-btn"
                    title="Instagram GenRe Buleleng"
                    aria-label="Instagram"
                  >
                    <IconInstagram size={18} />
                  </a>
                )}

                {settings?.tiktok_url && (
                  <a 
                    href={settings.tiktok_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-btn"
                    title="TikTok GenRe Buleleng"
                    aria-label="TikTok"
                  >
                    <IconTikTok size={18} />
                  </a>
                )}

                {settings?.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-btn"
                    title="Facebook GenRe Buleleng"
                    aria-label="Facebook"
                  >
                    <IconFacebook size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Navigasi Menu */}
          <div className="footer-block footer-nav-block">
            <h4 className="footer-heading">Menu Halaman</h4>
            <ul className="footer-menu">
              <li><Link to="/">Beranda</Link></li>
              <li><Link to="/edukasi">Pusat Edukasi</Link></li>
              <li><Link to="/quiz">Uji Pemahaman (Quiz)</Link></li>
              <li><Link to="/berita">Program Kerja & Berita</Link></li>
              <li><Link to="/konselor">Konselor Sebaya</Link></li>
              <li><Link to="/galeri">Galeri Kegiatan</Link></li>
              <li><Link to="/kontak">Hubungi Kami</Link></li>
            </ul>
          </div>

          {/* Kontak & Alamat Sekretariat */}
          <div className="footer-block footer-contact-block">
            <h4 className="footer-heading">Sekretariat</h4>
            <div className="footer-contact-info">
              <div className="contact-row">
                <IconMapPin size={18} className="contact-icon" />
                <div className="contact-text">
                  <strong>Kantor DP2KBP3A Kab. Buleleng</strong>
                  <span>{settings?.address || 'Jl. Veteran No. 9, Singaraja, Kabupaten Buleleng, Bali'}</span>
                </div>
              </div>

              {settings?.phone && (
                <div className="contact-row">
                  <IconPhone size={18} className="contact-icon" />
                  <div className="contact-text">
                    <strong>Telepon</strong>
                    <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                  </div>
                </div>
              )}

              {settings?.email && (
                <div className="contact-row">
                  <IconMail size={18} className="contact-icon" />
                  <div className="contact-text">
                    <strong>Email</strong>
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            &copy; {currentYear} Forum GenRe Kabupaten Buleleng. Hak Cipta Dilindungi.
          </p>
          <p className="instansi-text">
            Dinas Pengendalian Penduduk, KB, Pemberdayaan Perempuan dan Perlindungan Anak (DP2KBP3A)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
