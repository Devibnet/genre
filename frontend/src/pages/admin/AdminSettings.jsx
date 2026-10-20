import React, { useState, useEffect } from 'react';
import settingsService from '../../services/settingsService';
import { Spinner } from '../../components/common/Loading';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconTrash, IconImage } from '../../components/common/Icons';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    email: '',
    phone: '',
    address: '',
    instagram: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Delete Confirm State
  const [isDeleteLogoModalOpen, setIsDeleteLogoModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getAdminSettings();
      setSettings(data || {
        email: '',
        phone: '',
        address: '',
        instagram: '',
        logo_url: '',
      });
    } catch (err) {
      showToast(err.message || 'Gagal memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { logo_url, ...payload } = settings;
      await settingsService.updateSettings(payload);
      showToast('Pengaturan berhasil disimpan');
      fetchSettings();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setSubmitting(true);
    try {
      await settingsService.uploadLogo(logoFile);
      showToast('Logo website berhasil diperbarui');
      setLogoFile(null);
      fetchSettings();
    } catch (err) {
      showToast(err.message || 'Gagal mengupload logo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteLogo = async () => {
    setIsDeleting(true);
    try {
      await settingsService.deleteLogo();
      showToast('Logo website berhasil dihapus');
      setIsDeleteLogoModalOpen(false);
      fetchSettings();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus logo', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Spinner message="Memuat pengaturan website..." />;

  return (
    <div className="admin-page-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Pengaturan Website</h1>
          <p>Kelola konfigurasi kontak organisasi, media sosial, dan logo resmi Forum GenRe Buleleng</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Core Settings Form */}
        <div className="dash-panel">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
            Kontak & Sosial Media
          </h2>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Hubungan Masyarakat</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={settings.email || ''}
                onChange={handleChange}
                placeholder="genre.buleleng@gmail.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Nomor Telepon / WhatsApp CS</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={settings.phone || ''}
                onChange={handleChange}
                placeholder="628xxxxxxxxxx"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="instagram">Username Instagram Resmi</label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                className="form-input"
                value={settings.instagram || ''}
                onChange={handleChange}
                placeholder="@genre_buleleng"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">Alamat Sekretariat Kantor</label>
              <textarea
                id="address"
                name="address"
                className="form-input"
                value={settings.address || ''}
                onChange={handleChange}
                placeholder="Jalan Pahlawan No. 1, Singaraja, Buleleng, Bali"
                rows={4}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>

        {/* Logo Management Section */}
        <div className="dash-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark)' }}>Logo Website</h2>
          
          {settings.logo_url ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--slate-50)' }}>
                <img
                  src={settings.logo_url}
                  alt="Logo GenRe Buleleng"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsDeleteLogoModalOpen(true)}
                disabled={submitting}
              >
                <IconTrash size={14} />
                <span>Hapus Logo</span>
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px 0', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
              Belum ada logo dikonfigurasi. Menggunakan logo default.
            </div>
          )}

          <div style={{ width: '100%', borderTop: '1px solid var(--slate-100)', paddingTop: '20px' }}>
            <form onSubmit={handleUploadLogo} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Upload Logo Baru</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={submitting || !logoFile}>
                <IconImage size={14} />
                <span>Upload Logo</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Logo Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteLogoModalOpen}
        onClose={() => setIsDeleteLogoModalOpen(false)}
        onConfirm={handleConfirmDeleteLogo}
        title="Hapus Logo Website"
        message="Apakah Anda yakin ingin menghapus logo kustom website? Website akan kembali menggunakan logo default."
        confirmText="Hapus Logo"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminSettings;
