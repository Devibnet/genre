import React from 'react';
import './CounselorCard.css';

const CounselorCard = ({ counselor, onChatClick }) => {
  const { name, age, photo_url, description, status } = counselor;

  // Generate initials for avatar fallback
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'KS';

  return (
    <div className={`counselor-card card animated-fade-in ${status === 'inactive' ? 'counselor-inactive' : ''}`}>
      <div className="counselor-img-wrapper">
        {photo_url ? (
          <img
            src={photo_url}
            alt={name}
            className="counselor-img"
            loading="lazy"
          />
        ) : (
          <div className="counselor-avatar-fallback">
            <span>{initials}</span>
          </div>
        )}
        {status === 'inactive' && (
          <span className="counselor-status-badge">Tidak Aktif</span>
        )}
      </div>
      <div className="card-body counselor-body">
        <h3 className="counselor-name">{name}</h3>
        <p className="counselor-meta">Konselor Sebaya{age ? ` • ${age} Tahun` : ''}</p>
        <p className="card-desc counselor-desc">{description || 'Konselor sebaya GenRe siap mendampingi kamu.'}</p>
        
        {status !== 'inactive' && (
          <button
            className="btn btn-primary btn-full counselor-chat-btn"
            onClick={onChatClick}
            style={{ marginTop: 'auto' }}
          >
            Konseling &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

export default CounselorCard;
