import React, { useState, useEffect } from 'react';
import counselorService from '../../services/counselorService';
import { SkeletonTable } from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import { IconPlus, IconEdit, IconTrash, IconImage } from '../../components/common/Icons';

const AdminCounselors = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentCounselor, setCurrentCounselor] = useState(null);

  // Delete Confirm States
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    description: '',
    whatsapp_number: '',
    status: 'active',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCounselors = async (p = 1) => {
    setLoading(true);
    try {
      const res = await counselorService.getAdminCounselors({ page: p, per_page: 10 });
      setCounselors(res.data || res || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message || 'Gagal memuat konselor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors(page);
  }, [page]);

  const handleOpenAdd = () => {
    setCurrentCounselor(null);
    setFormData({
      name: '',
      age: '',
      description: '',
      whatsapp_number: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setCurrentCounselor(c);
    setFormData({
      name: c.name || '',
      age: c.age || '',
      description: c.description || '',
      whatsapp_number: c.whatsapp_number || '',
      status: c.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenPhoto = (c) => {
    setCurrentCounselor(c);
    setPhotoFile(null);
    setIsPhotoModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
      };

      if (currentCounselor) {
        await counselorService.updateCounselor(currentCounselor.id, payload);
        showToast('Data konselor berhasil diperbarui');
      } else {
        const created = await counselorService.createCounselor(payload);
        // Otomatis upload foto ke Supabase Storage setelah konselor dibuat
        if (photoFile && created?.id) {
          try {
            await counselorService.uploadPhoto(created.id, photoFile);
          } catch {
            showToast('Konselor dibuat, tapi gagal upload foto profil.', 'error');
          }
        }
        showToast('Konselor baru berhasil ditambahkan');
        setPhotoFile(null);
      }
      setIsModalOpen(false);
      fetchCounselors(page);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan konselor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await counselorService.deleteCounselor(deleteTarget.id);
      showToast('Konselor berhasil dihapus');
      setDeleteTarget(null);
      fetchCounselors(page);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus konselor', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setSubmitting(true);
    try {
      await counselorService.uploadPhoto(currentCounselor.id, photoFile);
      showToast('Foto profil konselor berhasil diupload');
      setIsPhotoModalOpen(false);
      fetchCounselors(page);
    } catch (err) {
      showToast(err.message || 'Gagal mengupload foto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!deletePhotoTarget) return;
    setIsDeleting(true);
    try {
      await counselorService.deletePhoto(deletePhotoTarget.id);
      showToast('Foto profil berhasil dihapus');
      setDeletePhotoTarget(null);
      setIsPhotoModalOpen(false);
      fetchCounselors(page);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus foto', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

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
          <h1>Daftar Konselor Sebaya</h1>
          <p>Kelola profil konselor sebaya aktif dan informasi kontak WhatsApp</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <IconPlus size={16} />
          <span>Tambah Konselor</span>
        </button>
      </div>

      <div className="dash-panel">
        {loading && counselors.length === 0 ? (
          <SkeletonTable rows={5} cols={5} />
        ) : counselors.length === 0 ? (
          <div className="dash-empty">Belum ada data konselor terdaftar.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nama Konselor</th>
                    <th>Umur</th>
                    <th>No. WhatsApp</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {counselors.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={c.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleOpenPhoto(c)}
                            title="Klik untuk ubah foto"
                          />
                        ) : (
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleOpenPhoto(c)}
                            title="Klik untuk upload foto"
                          >
                            {c.name ? c.name.charAt(0).toUpperCase() : 'K'}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{c.name}</div>
                        {c.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                            {c.description.substring(0, 40)}...
                          </div>
                        )}
                      </td>
                      <td>{c.age} Tahun</td>
                      <td>
                        <a
                          href={`https://wa.me/${c.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 500 }}
                        >
                          +{c.whatsapp_number}
                        </a>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-outline'}`}>
                          {c.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => handleOpenEdit(c)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IconEdit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setDeleteTarget(c)}
                          >
                            <IconTrash size={14} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.total_pages > 1 && (
              <div className="pagination" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  &larr; Sebelumnya
                </button>
                <span className="page-info">
                  Halaman {page} dari {meta.total_pages}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCounselor ? 'Edit Data Konselor' : 'Tambah Konselor Baru'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nama Lengkap *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Contoh: Budi Santoso"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="age">Umur (Tahun) *</label>
            <input
              type="number"
              id="age"
              name="age"
              className="form-input"
              value={formData.age}
              onChange={handleInputChange}
              required
              min={15}
              max={60}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="whatsapp_number">Nomor WhatsApp *</label>
            <input
              type="tel"
              id="whatsapp_number"
              name="whatsapp_number"
              className="form-input"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
              required
              placeholder="Contoh: 628123456789 (gunakan format internasional tanpa +)"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Deskripsi Singkat / Pengalaman</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Keahlian konseling, prestasi, atau organisasi..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          {/* Input foto — hanya saat tambah konselor baru */}
          {!currentCounselor && (
            <div className="form-group">
              <label className="form-label" htmlFor="photo_file">
                Foto Profil <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>(opsional, disimpan ke Supabase Storage)</span>
              </label>
              <input
                type="file"
                id="photo_file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
              />
              {photoFile && (
                <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '6px' }}>
                  {photoFile.name}
                </p>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Ubah Foto Profil Konselor"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {currentCounselor?.photo_url ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <img
                src={currentCounselor.photo_url}
                alt="Foto Profil"
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '3px solid var(--primary)' }}
              />
              <div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: 'var(--error-hover)', borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setDeletePhotoTarget(currentCounselor)}
                  disabled={submitting}
                >
                  <IconTrash size={14} />
                  <span>Hapus Foto Profil</span>
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--slate-400)' }}>Belum memiliki foto profil.</p>
          )}

          <form onSubmit={handleUploadPhoto} style={{ width: '100%', borderTop: '1px solid var(--slate-200)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} required />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsPhotoModalOpen(false)}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !photoFile}>Upload Foto</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirm Delete Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Konselor"
        message={`Apakah Anda yakin ingin menghapus data konselor "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={Boolean(deletePhotoTarget)}
        onClose={() => setDeletePhotoTarget(null)}
        onConfirm={handleConfirmDeletePhoto}
        title="Hapus Foto Profil"
        message="Apakah Anda yakin ingin menghapus foto profil konselor ini?"
        confirmText="Hapus Foto"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCounselors;
