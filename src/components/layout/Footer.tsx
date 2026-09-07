import React from 'react';
import { Link } from 'react-router-dom';
import { restaurant } from '../../data/restaurant';
import { useSiteSettings } from '../../hooks/useSiteSettings';
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
  const { settings } = useSiteSettings();

  const brandName = settings.site_short_name || 'Surya';
  const brandTagline = settings.site_tagline || 'Multicuisine Restaurant & Cafe';
  const fullName = settings.site_name || restaurant.name;
  const logoUrl = settings.logo_url || '/images/branding/logo.svg';
  const address = settings.address_full || restaurant.address.full;
  const phone = settings.contact_phone || restaurant.contact.phone;
  const phoneDisplay = settings.contact_phone_display || restaurant.contact.phoneDisplay;
  const hours = settings.operating_hours || restaurant.hours.display;
  const directionsUrl = settings.google_maps_url || restaurant.links.directions;

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logoUrl} alt={`${brandName} Logo`} className="footer-logo-img" width="44" height="44" />
              <div>
                <h3 className="footer-brand-name">{brandName}</h3>
                <p className="footer-brand-sub">{brandTagline}</p>
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
                <p>{address}</p>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">📞</span>
                <a href={`tel:${phone}`}>{phoneDisplay}</a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">🕐</span>
                <p>{restaurant.hours.days}<br />{hours}</p>
              </div>
            </div>
          </div>

          {/* Order & Reviews */}
          <div className="footer-section">
            <h4 className="footer-section-title">Order & Reviews</h4>
            <div className="footer-platform-links">
              <Link to="/menu" className="footer-platform-link" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                🛵 Direct Online Order (COD)
              </Link>
              <a href={restaurant.links.swiggy} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🏷️ Swiggy Listing
              </a>
              <a href={restaurant.links.district} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🍽️ Zomato Listing
              </a>
              <a href={restaurant.links.googleReviews} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                ⭐ Google Reviews
              </a>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="footer-platform-link">
                🗺️ Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
