import React, { useState } from 'react';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { restaurant } from '../data/restaurant';
import { submitContactMessage } from '../services/contactService';
import './Contact.css';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.name.trim()) errs.name = 'Please enter your name';
    if (!formData.message.trim()) errs.message = 'Please enter your message';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to send message. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-content">
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you — reach out anytime for feedback, queries, or event bookings</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container">
          {/* Contact Details & Map */}
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

          {/* Interactive Contact Form Section */}
          <div className="contact-form-section">
            <SectionHeading
              title="Send Us a Message"
              subtitle="Have a question or feedback? Fill in your details below and our team will get back to you"
            />
            <div className="contact-form-grid">
              <div className="contact-form-wrapper">
                {errorMessage && (
                  <div style={{
                    backgroundColor: 'rgba(229, 57, 53, 0.15)',
                    border: '1px solid var(--color-error)',
                    color: '#ff8a80',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                  }}>
                    {errorMessage}
                  </div>
                )}

                {submitted ? (
                  <div className="contact-form-success">
                    <span>✉️</span>
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for contacting Surya Multi Cuisine Restaurant. Our management team will review your message shortly.</p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form" noValidate>
                    <div className="form-group">
                      <label htmlFor="contact-name">Your Name *</label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? 'form-error' : ''}
                        required
                      />
                      {errors.name && <span className="form-error-msg">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-phone">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          id="contact-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address (Optional)</label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={errors.email ? 'form-error' : ''}
                        />
                        {errors.email && <span className="form-error-msg">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message">Your Message *</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Share your dining experience, party catering inquiry, or any questions..."
                        className={errors.message ? 'form-error' : ''}
                        required
                      />
                      {errors.message && <span className="form-error-msg">{errors.message}</span>}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={submitting}
                      icon={<span>📤</span>}
                    >
                      {submitting ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>

              {/* Quick FAQ / Info */}
              <div className="contact-faq">
                <div className="contact-faq-item">
                  <h4>🎉 Party & Bulk Orders</h4>
                  <p>Planning a birthday, family celebration, or corporate lunch? Call us for custom multicuisine catering menus and special party packages.</p>
                </div>
                <div className="contact-faq-item">
                  <h4>📦 Takeaway & Parcels</h4>
                  <p>Freshly packed hot parcels available all day from 11:00 AM to 11:00 PM. Call in advance to keep your order ready.</p>
                </div>
                <div className="contact-faq-item">
                  <h4>🛵 Delivery Partners</h4>
                  <p>We are officially partnered with Swiggy and Zomato/District for fast delivery to Ambattur and neighboring locations.</p>
                </div>
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
