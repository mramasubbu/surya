import React from 'react';
import { Link } from 'react-router-dom';
import { restaurant } from '../../data/restaurant';
import './Footer.css';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/menu', label: 'Our Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/contact', label: 'Contact' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/images/branding/logo.svg" alt="Surya Logo" className="footer-logo-img" width="44" height="44" />
              <div>
                <h3 className="footer-brand-name">Surya</h3>
                <p className="footer-brand-sub">Multicuisine Restaurant & Cafe</p>
              </div>
            </div>
            <p className="footer-desc">{restaurant.shortDescription}</p>
            <div className="footer-cuisines">
              {restaurant.cuisines.slice(0, 5).map((c) => (
                <span key={c} className="cuisine-tag">{c}</span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <nav className="footer-links" aria-label="Footer navigation">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="footer-link">{link.label}</Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <span className="footer-contact-icon">📍</span>
                <p>{restaurant.address.full}</p>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">📞</span>
                <a href={`tel:${restaurant.contact.phone}`}>{restaurant.contact.phoneDisplay}</a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">🕐</span>
                <p>{restaurant.hours.days}<br />{restaurant.hours.display}</p>
              </div>
            </div>
          </div>

          {/* Order & Reviews */}
          <div className="footer-section">
            <h4 className="footer-section-title">Order & Reviews</h4>
            <div className="footer-platform-links">
              <a href={restaurant.links.swiggy} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🛵 Order on Swiggy
              </a>
              <a href={restaurant.links.district} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🍽️ View on Zomato
              </a>
              <a href={restaurant.links.googleReviews} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                ⭐ Google Reviews
              </a>
              <a href={restaurant.links.directions} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🗺️ Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
