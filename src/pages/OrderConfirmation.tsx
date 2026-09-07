import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchOrderByToken } from '../services/orderService';
import type { OrderRow, OrderItemRow, OrderStatus } from '../types/database';
import { restaurant } from '../data/restaurant';
import { Button } from '../components/common/Button';
import './OrderConfirmation.css';

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'Received', icon: '📝' },
  { status: 'confirmed', label: 'Confirmed', icon: '✓' },
  { status: 'preparing', label: 'Preparing', icon: '🍳' },
  { status: 'ready', label: 'Ready', icon: '📦' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { status: 'delivered', label: 'Delivered', icon: '🍽️' },
];

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError('Order number not provided.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadOrder = async () => {
      try {
        const res = await fetchOrderByToken(orderNumber, tokenFromUrl);
        if (!isMounted) return;

        if (res && res.success) {
          setOrder(res.order);
          setItems(res.items);
          setError(null);
        } else {
          setError('Order not found or authorization token is invalid.');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load order.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();

    // Live polling: Poll every 12 seconds for status updates if order is not delivered
    const interval = setInterval(() => {
      if (order?.order_status !== 'delivered') {
        loadOrder();
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderNumber, tokenFromUrl, order?.order_status]);

  if (loading) {
    return (
      <main className="order-confirm-page">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 1.5rem',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-confirm-page">
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2 style={{ color: '#ef4444', margin: '1rem 0' }}>Access Denied or Order Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            {error || 'You do not have permission to view this order without a valid order token.'}
          </p>
          <Button variant="primary" size="md" href="/menu">
            Browse Menu
          </Button>
        </div>
      </main>
    );
  }

  // Calculate current step index
  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === order.order_status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="order-confirm-page">
      <div className="container order-confirm-container">
        {/* Hero Success Card */}
        <section className="confirm-hero-card" aria-label="Order Confirmation">
          <div className="confirm-success-badge">✓</div>
          <h1 className="confirm-title">Order Placed Successfully!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            Thank you, <strong>{order.customer_name}</strong>. Your food order has been sent to our kitchen.
          </p>

          <div className="confirm-order-tag">Order #{order.order_number}</div>

          <div>
            <div className="confirm-cod-notice">
              <span>💵</span>
              <span>
                <strong>Cash on Delivery:</strong> Please keep <strong>₹{order.total_amount}</strong> ready in cash upon arrival.
              </span>
            </div>
          </div>
        </section>

        {/* Live Status Tracker */}
        <section className="timeline-section" aria-label="Order Status Progress">
          <div className="timeline-title">
            <span>Live Order Status</span>
            <span className="timeline-live-indicator">
              <span className="live-pulse" /> Live Tracking
            </span>
          </div>

          <div className="order-timeline-track">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && step.status === 'delivered');
              const isActive = idx === currentStepIndex && step.status !== 'delivered';

              return (
                <div
                  key={step.status}
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="step-node">
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Order Details & Receipt */}
        <div className="order-details-grid">
          {/* Delivery Information */}
          <section className="details-card">
            <h3><span>📍</span> Delivery Information</h3>
            <div className="info-line">
              <span>Customer Name:</span>
              <strong>{order.customer_name}</strong>
            </div>
            <div className="info-line">
              <span>Phone Number:</span>
              <strong>{order.customer_phone}</strong>
            </div>
            <div className="info-line">
              <span>Email:</span>
              <span>{order.customer_email}</span>
            </div>
            <div className="info-line" style={{ flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              <span>Delivery Address:</span>
              <strong style={{ lineHeight: 1.4 }}>
                {order.delivery_address}
                {order.landmark ? `, Landmark: ${order.landmark}` : ''} - {order.pincode}
              </strong>
            </div>
            {order.customer_notes && (
              <div className="info-line" style={{ flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                <span>Cooking / Delivery Note:</span>
                <span style={{ fontStyle: 'italic', color: '#fbbf24' }}>
                  "{order.customer_notes}"
                </span>
              </div>
            )}
          </section>

          {/* Payment & Restaurant Info */}
          <section className="details-card">
            <h3><span>💳</span> Payment & Details</h3>
            <div className="info-line">
              <span>Payment Mode:</span>
              <strong style={{ color: '#22c55e' }}>Cash on Delivery</strong>
            </div>
            <div className="info-line">
              <span>Payment Status:</span>
              <strong style={{ textTransform: 'capitalize', color: '#fbbf24' }}>
                {order.payment_status}
              </strong>
            </div>
            <div className="info-line">
              <span>Order Time:</span>
              <span>{new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
            <div className="info-line">
              <span>Restaurant:</span>
              <span>{restaurant.shortName}</span>
            </div>
            <div className="info-line">
              <span>Kitchen Phone:</span>
              <a href={restaurant.contact.phone} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {restaurant.contact.phoneDisplay}
              </a>
            </div>
          </section>
        </div>

        {/* Itemized Tax Invoice / Receipt */}
        <section className="details-card" aria-label="Tax Invoice Receipt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, border: 'none', padding: 0 }}>
                <span>🧾</span> Order Receipt / Tax Invoice
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {restaurant.address.line1}, {restaurant.address.line2}, Chennai - {restaurant.address.pincode}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              #{order.order_number}
            </span>
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.item_price}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.line_total}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', color: 'var(--color-text-secondary)', paddingTop: '12px' }}>
                  Food Subtotal:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, paddingTop: '12px' }}>
                  ₹{order.subtotal}
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                  Delivery Fee:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {order.delivery_fee === 0 ? (
                    <span style={{ color: '#f97316' }}>Extra at Doorstep</span>
                  ) : (
                    `₹${order.delivery_fee}`
                  )}
                </td>
              </tr>
              <tr className="receipt-total-row">
                <td colSpan={3} style={{ textAlign: 'right' }}>
                  Total Amount (Pay in Cash):
                </td>
                <td style={{ textAlign: 'right' }}>
                  ₹{order.total_amount}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Action Buttons */}
        <div className="order-action-buttons">
          <Button variant="outline" size="md" onClick={handlePrint} icon={<span>🖨️</span>}>
            Print Receipt / Invoice
          </Button>
          <Button variant="primary" size="md" href="/menu">
            Order More Food
          </Button>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
