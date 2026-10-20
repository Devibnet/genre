import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
