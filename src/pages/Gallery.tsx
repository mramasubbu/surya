import React, { useState, useCallback } from 'react';
import { galleryImages, galleryCategories, type GalleryImage } from '../data/gallery';
import './Gallery.css';

export const Gallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filtered = activeFilter === 'all'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeFilter);

  const openLightbox = useCallback((img: GalleryImage) => {
    setLightboxImage(img);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxImage(null);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    if (!lightboxImage) return;
    const idx = filtered.findIndex((i) => i.id === lightboxImage.id);
    const next = (idx + dir + filtered.length) % filtered.length;
    setLightboxImage(filtered[next]);
  }, [lightboxImage, filtered]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!lightboxImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxImage, closeLightbox, navigateLightbox]);

  return (
    <main className="page-content">
      <section className="page-hero">
        <div className="container">
          <h1>Gallery</h1>
          <p>A visual taste of our food, ambience, and dining experience</p>
        </div>
      </section>

      <section className="section gallery-section">
        <div className="container">
          {/* Filters */}
          <div className="gallery-filters">
            {galleryCategories.map((cat) => (
              <button
                key={cat.id}
                className={`gallery-filter ${activeFilter === cat.id ? 'gallery-filter-active' : ''}`}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="gallery-grid">
            {filtered.map((img) => (
              <button
                key={img.id}
                className="gallery-item"
                onClick={() => openLightbox(img)}
                aria-label={`View ${img.alt}`}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-zoom">🔍</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" role="dialog" aria-label="Image viewer" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} aria-label="Previous image">‹</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.src} alt={lightboxImage.alt} />
            <p className="lightbox-caption">{lightboxImage.alt}</p>
          </div>
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} aria-label="Next image">›</button>
        </div>
      )}
    </main>
  );
};

export default Gallery;
