import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { restaurant } from '../../data/restaurant';
import { Button } from '../common/Button';
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
        <Link to="/" className="header-logo" aria-label="Surya Restaurant Home">
          <img src="/images/branding/logo.svg" alt="Surya Logo" className="logo-img" width="40" height="40" />
          <div className="logo-text">
            <span className="logo-name">Surya</span>
            <span className="logo-tagline">Multicuisine Restaurant</span>
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
          <Button
            variant="outline"
            size="sm"
            href={restaurant.links.swiggy}
            target="_blank"
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
          <Button variant="outline" size="lg" fullWidth href={restaurant.links.swiggy} target="_blank">
            Order Online
          </Button>
          <Button variant="primary" size="lg" fullWidth href="/reservations">
            Reserve Table
          </Button>
          <Button variant="ghost" size="lg" fullWidth href={`tel:${restaurant.contact.phone}`}>
            📞 Call Now
          </Button>
        </div>
      </div>
    </header>
  );
};
