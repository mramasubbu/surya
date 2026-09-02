import React from 'react';
import { restaurant } from '../../data/restaurant';
import './MobileActionBar.css';

export const MobileActionBar: React.FC = () => {
  return (
    <div className="mobile-action-bar" role="navigation" aria-label="Quick actions">
      <a href={`tel:${restaurant.contact.phone}`} className="mobile-action" aria-label="Call restaurant">
        <span className="mobile-action-icon">📞</span>
        <span className="mobile-action-label">Call</span>
      </a>
      <a
        href={`https://wa.me/${restaurant.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent('Hi, I would like to know more about Surya Multicuisine Restaurant & Cafe.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-action"
        aria-label="WhatsApp"
      >
        <span className="mobile-action-icon">💬</span>
        <span className="mobile-action-label">WhatsApp</span>
      </a>
      <a href={restaurant.links.directions} target="_blank" rel="noopener noreferrer" className="mobile-action" aria-label="Get directions">
        <span className="mobile-action-icon">🗺️</span>
        <span className="mobile-action-label">Directions</span>
      </a>
      <a href={restaurant.links.swiggy} target="_blank" rel="noopener noreferrer" className="mobile-action mobile-action-primary" aria-label="Order online">
        <span className="mobile-action-icon">🛵</span>
        <span className="mobile-action-label">Order</span>
      </a>
    </div>
  );
};
