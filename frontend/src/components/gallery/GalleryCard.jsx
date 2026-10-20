import React from 'react';
import './GalleryCard.css';

const GalleryCard = ({ item, onClick }) => {
  const { image_url, caption } = item;

  return (
    <div className="gallery-card animated-fade-in" onClick={onClick}>
      <img src={image_url} alt={caption || 'Foto Galeri'} className="gallery-img" loading="lazy" />
      <div className="gallery-overlay">
        <p className="gallery-caption">{caption || 'Dokumentasi Kegiatan'}</p>
        <span className="gallery-zoom-label">Lihat Photo</span>
      </div>
    </div>
  );
};

export default GalleryCard;
