import React, { useState } from 'react';
import { restaurant, whatsappReservationMessage, getWhatsAppUrl } from '../data/restaurant';
import { Button } from '../components/common/Button';
import { createBooking } from '../services/bookingService';
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
  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<ReservationForm | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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
    const cleanPhone = form.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) newErrors.phone = 'Please enter a valid 10-digit phone number';
    if (!form.date) newErrors.date = 'Please select a reservation date';
    if (!form.time) newErrors.time = 'Please select a preferred dining time';
    if (form.guests < 1 || form.guests > 20) newErrors.guests = 'Guests count must be between 1 and 20';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createBooking({
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        booking_date: form.date,
        booking_time: form.time,
        guests: form.guests,
        message: form.message.trim() || undefined,
      });

      // Save for confirmation modal and reset form
      setSubmittedBooking({ ...form });
      setForm(initialForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to submit booking request. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
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
          <p>Book your table at Surya Multi Cuisine Restaurant — quick, easy, and hassle-free</p>
        </div>
      </section>

      <section className="section reservation-section">
        <div className="container">
          <div className="reservation-grid">
            <div className="reservation-form-wrapper">
              {apiError && (
                <div style={{
                  backgroundColor: 'rgba(229, 57, 53, 0.15)',
                  border: '1px solid var(--color-error)',
                  color: '#ff8a80',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                }}>
                  {apiError}
                </div>
              )}

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
                    required
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
                    placeholder="e.g. 9876543210"
                    className={errors.phone ? 'form-error' : ''}
                    required
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
                      required
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
                      required
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
                  <label htmlFor="message">Special Requests / Occasion (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Dietary preferences, birthday/anniversary setup, high chair..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={submitting}
                  icon={<span>📅</span>}
                >
                  {submitting ? 'Submitting Reservation...' : 'Request Table Reservation'}
                </Button>

                <p className="form-disclaimer">
                  Your table reservation request will be recorded and marked as <strong>Pending</strong>.
                  Our team will contact you to confirm your table.
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
                <p>Prefer to reserve by phone? Call us at:</p>
                <a href={`tel:${restaurant.contact.phone}`} className="reservation-phone">
                  {restaurant.contact.phoneDisplay}
                </a>
              </div>
              <div className="reservation-info-card">
                <h3>💡 Good to Know</h3>
                <ul>
                  <li>Walk-ins are welcome, subject to table availability</li>
                  <li>For gatherings larger than 15, please call in advance</li>
                  <li>We recommend arriving 5–10 minutes prior to your reserved time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      {submittedBooking && (
        <div className="reservation-success-modal-overlay" onClick={() => setSubmittedBooking(null)}>
          <div className="reservation-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-badge">✓</div>
            <h2>Reservation Request Submitted!</h2>
            <p>
              Thank you, <strong>{submittedBooking.name}</strong>. Your table booking request has been submitted successfully.
              Our team will review your request and contact you to confirm your booking.
            </p>

            <div className="success-details-card">
              <div className="success-details-row">
                <span style={{ color: 'var(--color-text-secondary)' }}>Date:</span>
                <strong>{submittedBooking.date}</strong>
              </div>
              <div className="success-details-row">
                <span style={{ color: 'var(--color-text-secondary)' }}>Time:</span>
                <strong>{submittedBooking.time}</strong>
              </div>
              <div className="success-details-row">
                <span style={{ color: 'var(--color-text-secondary)' }}>Guests:</span>
                <strong>{submittedBooking.guests} Person(s)</strong>
              </div>
              <div className="success-details-row">
                <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>Pending Confirmation</span>
              </div>
            </div>

            <div className="success-modal-actions">
              <Button
                variant="outline"
                size="md"
                fullWidth
                href={getWhatsAppUrl(whatsappReservationMessage(submittedBooking))}
                target="_blank"
                icon={<span>💬</span>}
              >
                Also Send via WhatsApp
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setSubmittedBooking(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Reservations;
