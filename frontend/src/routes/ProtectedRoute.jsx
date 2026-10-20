import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/layout/AdminSidebar';

const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--slate-500)' }}>Memuat sesi...</p>
      </div>
    );
  }

  // Check if authenticated and is admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-main-wrapper" style={{ padding: '32px 24px 64px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
