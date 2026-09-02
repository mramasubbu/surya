import React, { useState } from 'react';
import { restaurant, whatsappReservationMessage, getWhatsAppUrl } from '../data/restaurant';
import { Button } from '../components/common/Button';
import './Reservations.css';

interface ReservationForm {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message: string;
}

const initialForm: ReservationForm = {
  name: '',
  phone: '',
  date: '',
  time: '19:00',
  guests: 2,
  message: '',
};

export const Reservations: React.FC = () => {
  const [form, setForm] = useState<ReservationForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationForm, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'guests' ? parseInt(value) || 1 : value }));
    if (errors[name as keyof ReservationForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ReservationForm, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Please enter your name';
    if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = 'Please enter a valid phone number';
    if (!form.date) newErrors.date = 'Please select a date';
    if (!form.time) newErrors.time = 'Please select a time';
    if (form.guests < 1 || form.guests > 20) newErrors.guests = 'Guests must be between 1 and 20';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const msg = whatsappReservationMessage(form);
    const url = getWhatsAppUrl(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Get tomorrow's date as minimum for the date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <main className="page-content">
      <section className="page-hero">
        <div className="container">
          <h1>Reserve a Table</h1>
          <p>Book your table via WhatsApp — quick and easy</p>
        </div>
      </section>

      <section className="section reservation-section">
        <div className="container">
          <div className="reservation-grid">
            <div className="reservation-form-wrapper">
              <form onSubmit={handleSubmit} className="reservation-form" noValidate>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={errors.name ? 'form-error' : ''}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    className={errors.phone ? 'form-error' : ''}
                  />
                  {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      min={minDate}
                      className={errors.date ? 'form-error' : ''}
                    />
                    {errors.date && <span className="form-error-msg">{errors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Preferred Time *</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className={errors.time ? 'form-error' : ''}
                    />
                    {errors.time && <span className="form-error-msg">{errors.time}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="guests">Number of Guests *</label>
                  <select id="guests" name="guests" value={form.guests} onChange={handleChange}>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Additional Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Any special requests, dietary needs, or occasion details..."
                    rows={3}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth icon={<span>💬</span>}>
                  Send via WhatsApp
                </Button>

                <p className="form-disclaimer">
                  Your reservation request will be sent via WhatsApp to the restaurant.
                  The restaurant will confirm your booking directly. This is not an automatic confirmation.
                </p>
              </form>
            </div>

            <div className="reservation-info">
              <div className="reservation-info-card">
                <h3>📍 Location</h3>
                <p>{restaurant.address.full}</p>
              </div>
              <div className="reservation-info-card">
                <h3>🕐 Opening Hours</h3>
                <p>{restaurant.hours.days}</p>
                <p>{restaurant.hours.display}</p>
              </div>
              <div className="reservation-info-card">
                <h3>📞 Call Us</h3>
                <p>Prefer to call? Reach us at:</p>
                <a href={`tel:${restaurant.contact.phone}`} className="reservation-phone">
                  {restaurant.contact.phoneDisplay}
                </a>
              </div>
              <div className="reservation-info-card">
                <h3>💡 Good to Know</h3>
                <ul>
                  <li>Walk-ins are welcome, subject to availability</li>
                  <li>For groups larger than 10, please call ahead</li>
                  <li>Arrive 5–10 minutes before your reserved time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Reservations;
