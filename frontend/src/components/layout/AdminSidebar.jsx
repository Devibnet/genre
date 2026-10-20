import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', end: true },
    { name: 'Artikel', path: '/admin/articles' },
    { name: 'Program Kerja', path: '/admin/news' },
    { name: 'Quiz', path: '/admin/quizzes' },
    { name: 'Konselor Sebaya', path: '/admin/counselors' },
    { name: 'Masukan & Saran', path: '/admin/feedback' },
    { name: 'Galeri', path: '/admin/gallery' },
    { name: 'Pengaturan', path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Sidebar Trigger Toggle Header */}
      <div className="admin-mobile-header">
        <span className="admin-logo-text">GenRe <span>CMS</span></span>
        <button className="admin-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Tutup' : 'Menu'}
        </button>
      </div>

      <aside className={`admin-sidebar-aside ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-title">GenRe <span>Buleleng</span></span>
          <span className="brand-badge">Panel Admin</span>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-list">
            {menuItems.map((item) => (
              <li key={item.path} className="sidebar-item">
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'link-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="user-details">
              <p className="user-name">{currentUser?.profile?.name || 'Administrator'}</p>
              <p className="user-email">{currentUser?.user?.email || 'admin@genre.com'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-full btn-sm logout-btn">
            Keluar
          </button>
        </div>
      </aside>
      
      {/* Overlay background when mobile drawer is active */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default AdminSidebar;
