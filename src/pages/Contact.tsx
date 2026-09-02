import React from 'react';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { restaurant } from '../data/restaurant';
import './Contact.css';

export const Contact: React.FC = () => {
  return (
    <main className="page-content">
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you — reach out anytime</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Cards */}
            <div className="contact-cards">
              <div className="contact-card">
                <span className="contact-card-icon">📍</span>
                <h3>Visit Us</h3>
                <p>{restaurant.address.full}</p>
                <Button variant="outline" size="sm" href={restaurant.links.directions} target="_blank">
                  Get Directions
                </Button>
              </div>

              <div className="contact-card">
                <span className="contact-card-icon">📞</span>
                <h3>Call Us</h3>
                <a href={`tel:${restaurant.contact.phone}`} className="contact-phone">
                  {restaurant.contact.phoneDisplay}
                </a>
                <p>Call us for enquiries, takeaway orders, or reservations</p>
              </div>

              <div className="contact-card">
                <span className="contact-card-icon">💬</span>
                <h3>WhatsApp</h3>
                <p>Send us a message for quick enquiries or table reservations</p>
                <Button
                  variant="outline"
                  size="sm"
                  href={`https://wa.me/${restaurant.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent('Hi, I would like to know more about Surya Multicuisine Restaurant & Cafe.')}`}
                  target="_blank"
                >
                  Message on WhatsApp
                </Button>
              </div>

              <div className="contact-card">
                <span className="contact-card-icon">🕐</span>
                <h3>Opening Hours</h3>
                <p className="contact-hours">
                  <strong>{restaurant.hours.days}</strong><br />
                  {restaurant.hours.display}
                </p>
                <p className="contact-hours-note">{restaurant.hours.note}</p>
              </div>
            </div>

            {/* Map */}
            <div className="contact-map-section">
              <SectionHeading title="Our Location" align="left" />
              <div className="contact-map">
                <iframe
                  title="Surya Multicuisine Restaurant on Google Maps"
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0!2d${restaurant.location.lng}!3d${restaurant.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzI3LjEiTiA4MMKwMDknMDcuMCJF!5e0!3m2!1sen!2sin!4v1700000000000`}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Order Platforms */}
          <div className="contact-platforms">
            <SectionHeading title="Order & Explore" subtitle="Find us on these platforms" />
            <div className="platform-grid">
              <a href={restaurant.links.swiggy} target="_blank" rel="noopener noreferrer" className="platform-card">
                <span className="platform-icon">🛵</span>
                <h3>Swiggy</h3>
                <p>Order for delivery</p>
              </a>
              <a href={restaurant.links.district} target="_blank" rel="noopener noreferrer" className="platform-card">
                <span className="platform-icon">🍽️</span>
                <h3>Zomato / District</h3>
                <p>View menu & reviews</p>
              </a>
              <a href={restaurant.links.googleReviews} target="_blank" rel="noopener noreferrer" className="platform-card">
                <span className="platform-icon">⭐</span>
                <h3>Google Reviews</h3>
                <p>Read customer reviews</p>
              </a>
              <a href={restaurant.links.directions} target="_blank" rel="noopener noreferrer" className="platform-card">
                <span className="platform-icon">🗺️</span>
                <h3>Google Maps</h3>
                <p>Navigate to us</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
