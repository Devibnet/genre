import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingBottom: '48px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
