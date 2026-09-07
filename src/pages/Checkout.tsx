import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOnlineOrder } from '../services/orderService';
import { sendOrderEmailNotification } from '../services/emailService';
import { restaurant } from '../data/restaurant';
import { Button } from '../components/common/Button';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const {
    items,
    subtotal,
    deliveryFee,
    grandTotal,
    minOrderAmount,
    meetsMinimum,
    amountNeededForMinimum,
    clearCart,
    settings,
    refreshSettings,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    landmark: '',
    pincode: '600053',
    customer_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // If cart is empty, show return prompt
  if (items.length === 0 && !isSubmitting) {
    return (
      <main className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <span style={{ fontSize: '4rem' }}>🛒</span>
          <h2 style={{ margin: '1rem 0 0.5rem', color: 'var(--color-text-primary)' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Please select items from our menu before proceeding to checkout.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/menu')}>
            Browse Menu & Order
          </Button>
        </div>
      </main>
    );
  }

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errs.customer_name = 'Please enter your full name';
    }

    const cleanPhone = formData.customer_phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.customer_phone = 'Please enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customer_email.trim() || !emailRegex.test(formData.customer_email.trim())) {
      errs.customer_email = 'Please enter a valid email address for your order receipt';
    }

    if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 5) {
      errs.delivery_address = 'Please enter complete delivery address (House/Flat No, Street)';
    }

    const cleanPincode = formData.pincode.replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length !== 6) {
      errs.pincode = 'Please enter a 6-digit postal code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Prevent duplicate submission if already submitting
    if (isSubmitting) return;

    // Validate minimum order
    if (!meetsMinimum) {
      setServerError(
        `Minimum order amount is ₹${minOrderAmount}. Please add ₹${amountNeededForMinimum} more to your cart.`
      );
      return;
    }

    // Validate customer form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order in Supabase
      const result = await createOnlineOrder({
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        delivery_address: formData.delivery_address.trim(),
        landmark: formData.landmark.trim() || undefined,
        pincode: formData.pincode.trim(),
        customer_notes: formData.customer_notes.trim() || undefined,
        items: items.map((i) => ({
          menu_item_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      // 2. Clear cart
      clearCart();

      // 3. Fire-and-forget email notifications (Decoupled, doesn't block redirection)
      const orderForEmail = {
        id: result.order_id,
        order_number: result.order_number,
        access_token: result.access_token,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        delivery_address: formData.delivery_address.trim(),
        landmark: formData.landmark.trim() || null,
        pincode: formData.pincode.trim(),
        customer_notes: formData.customer_notes.trim() || null,
        subtotal: result.subtotal,
        delivery_fee: result.delivery_fee,
        total_amount: result.total_amount,
        payment_method: result.payment_method as any,
        payment_status: result.payment_status as any,
        order_status: result.order_status,
        order_source: 'website',
        created_at: result.created_at,
        updated_at: result.created_at,
      };

      const itemsForEmail = items.map((i) => ({
        id: i.id,
        order_id: result.order_id,
        menu_item_id: i.id,
        item_name: i.name,
        item_price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      }));

      // Customer receipt email
      sendOrderEmailNotification({
        type: 'NEW_ORDER_CUSTOMER',
        order: orderForEmail,
        items: itemsForEmail,
      }).catch((err) => console.warn('Customer email failed silently:', err));

      // Restaurant new order notification
      sendOrderEmailNotification({
        type: 'NEW_ORDER_RESTAURANT',
        order: orderForEmail,
        items: itemsForEmail,
      }).catch((err) => console.warn('Restaurant alert failed silently:', err));

      // 4. Redirect to tracking & confirmation page
      navigate(`/order-confirmation/${result.order_number}?token=${result.access_token}`, {
        replace: true,
      });
    } catch (err: unknown) {
      console.error('Order submission error:', err);
      setIsSubmitting(false);
      setServerError(
        err instanceof Error
          ? err.message
          : 'Unable to place order. Please check your network connection or call the restaurant directly.'
      );
    }
  };

  return (
    <main className="checkout-page">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/menu"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            ← Back to Menu
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              color: 'var(--color-text-primary)',
              margin: '0.5rem 0 0.25rem',
            }}
          >
            Checkout & Delivery
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Guest Checkout • Cash on Delivery • Direct from Surya Restaurant
          </p>
        </div>

        {serverError && (
          <div className="checkout-alert error">
            <span>⚠️</span>
            <div>{serverError}</div>
          </div>
        )}

        {!meetsMinimum && (
          <div className="checkout-alert warning">
            <span>⚠️</span>
            <div>
              Minimum order amount is <strong>₹{minOrderAmount}</strong>. Please add{' '}
              <strong>₹{amountNeededForMinimum}</strong> more dishes to complete your order.
            </div>
          </div>
        )}

        <div className="checkout-grid">
          {/* Customer & Address Form */}
          <section className="checkout-card" aria-label="Customer Delivery Details">
            <h2 className="checkout-section-title">
              <span>📍</span> 1. Delivery Details
            </h2>

            <form id="checkout-form" onSubmit={handleSubmitOrder} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer_name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  />
                  {errors.customer_name && (
                    <span className="field-error">{errors.customer_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="customer_phone">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    placeholder="e.g. 98765 43210"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={15}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.customer_phone && (
                    <span className="field-error">{errors.customer_phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer_email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  placeholder="name@example.com (for order receipt)"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={isSubmitting}
                />
                {errors.customer_email && (
                  <span className="field-error">{errors.customer_email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="delivery_address">
                  Delivery Address <span className="required">*</span>
                </label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  placeholder="Door/Flat No, Apartment Name, Street Name, Ambattur"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
                {errors.delivery_address && (
                  <span className="field-error">{errors.delivery_address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="landmark">Landmark (Optional)</label>
                  <input
                    type="text"
                    id="landmark"
                    name="landmark"
                    placeholder="e.g. Near TI Cycles, Ambattur OT"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">
                    Pincode <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    placeholder="600053"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={6}
                    required
                    disabled={isSubmitting}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer_notes">Cooking / Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  id="customer_notes"
                  name="customer_notes"
                  placeholder="e.g. Less spicy, Call when reaching main gate"
                  value={formData.customer_notes}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>

              {/* Payment Method */}
              <div style={{ marginTop: '1.5rem' }}>
                <h2 className="checkout-section-title">
                  <span>💵</span> 2. Payment Method
                </h2>

                <div className="payment-methods-list">
                  <label className="payment-method-card">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={true}
                      readOnly
                    />
                    <div className="payment-method-info">
                      <h4>
                        Cash on Delivery (COD)
                        <span className="payment-method-badge">Active</span>
                      </h4>
                      <p>
                        Pay in cash when your fresh food arrives at your door. Please keep the
                        exact amount ready for contactless handover.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </section>

          {/* Order Summary Sidebar */}
          <aside className="checkout-card" aria-label="Order Summary">
            <h2 className="checkout-section-title">
              <span>🧾</span> Order Summary
            </h2>

            <div className="checkout-summary-items">
              {items.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <div className="summary-item-title">
                    <span className={`diet-indicator ${item.diet}`} />
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                  </div>
                  <div className="summary-item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-line">
                <span>Food Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>₹{subtotal}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="summary-line">
                  <span>
                    Delivery Charges {settings.delivery_radius_km ? `(~${settings.delivery_radius_km} KM)` : ''}
                  </span>
                  <span>₹{deliveryFee}</span>
                </div>
              )}
              <div className="summary-line grand-total">
                <span>Total Amount (COD)</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="place-order-btn"
              disabled={isSubmitting || !meetsMinimum || !settings.is_ordering_enabled}
            >
              {isSubmitting ? (
                <>
                  <div className="checkout-spinner" />
                  <span>Placing Order...</span>
                </>
              ) : !settings.is_ordering_enabled ? (
                <span>Online Ordering Closed</span>
              ) : !meetsMinimum ? (
                <span>Add ₹{amountNeededForMinimum} more</span>
              ) : (
                <span>Place Order (Cash on Delivery) →</span>
              )}
            </button>

            {deliveryFee === 0 && (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#f97316',
                  background: 'rgba(249, 115, 22, 0.08)',
                  border: '1px dashed rgba(249, 115, 22, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.8rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  marginTop: '0.75rem',
                }}
              >
                🛵 Delivery fee extra based on delivery location
              </div>
            )}

            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                marginTop: '0.75rem',
                lineHeight: 1.4,
              }}
            >
              By placing this order, you confirm Cash on Delivery at your given address. For
              enquiries, call {restaurant.contact.phoneDisplay}.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
