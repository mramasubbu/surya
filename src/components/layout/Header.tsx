import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { restaurant } from '../../data/restaurant';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import './Header.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reservations', label: 'Reservations' },
  { to: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { totalCount, openCart } = useCart();
  const { settings } = useSiteSettings();

  const siteShortName = settings.site_short_name || 'Surya';
  const siteTagline = settings.site_tagline || 'Multicuisine Restaurant';
  const logoUrl = settings.logo_url || '/images/branding/logo.svg';
  const phone = settings.contact_phone || restaurant.contact.phone;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`} role="banner">
      <div className="header-inner container">
        <Link to="/" className="header-logo" aria-label={`${siteShortName} Home`}>
          <img src={logoUrl} alt={`${siteShortName} Logo`} className="logo-img" width="40" height="40" />
          <div className="logo-text">
            <span className="logo-name">{siteShortName}</span>
            <span className="logo-tagline">{siteTagline}</span>
          </div>
        </Link>

        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="header-cart-btn"
            onClick={openCart}
            aria-label={`View cart with ${totalCount} items`}
          >
            <span>🛒</span>
            <span>Cart</span>
            {totalCount > 0 && <span className="header-cart-badge">{totalCount}</span>}
          </button>
          <Button
            variant="outline"
            size="sm"
            href="/menu"
          >
            Order Online
          </Button>
          <Button
            variant="primary"
            size="sm"
            href="/reservations"
          >
            Reserve Table
          </Button>
        </div>

        <button
          className={`mobile-menu-btn ${isMobileOpen ? 'mobile-menu-btn-open' : ''}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileOpen ? 'mobile-nav-open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <nav className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'mobile-nav-link-active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-nav-actions">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setIsMobileOpen(false);
              openCart();
            }}
          >
            🛒 View Cart {totalCount > 0 ? `(${totalCount})` : ''}
          </Button>
          <Button variant="outline" size="lg" fullWidth href="/menu">
            Order Online
          </Button>
          <Button variant="ghost" size="lg" fullWidth href="/reservations">
            Reserve Table
          </Button>
          <Button variant="ghost" size="lg" fullWidth href={`tel:${phone}`}>
            📞 Call Now
          </Button>
        </div>
      </div>
    </header>
  );
};
