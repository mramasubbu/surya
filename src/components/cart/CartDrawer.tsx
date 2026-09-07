import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import './CartDrawer.css';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    clearCart,
    totalCount,
    subtotal,
    deliveryFee,
    grandTotal,
    minOrderAmount,
    meetsMinimum,
    amountNeededForMinimum,
    settings,
    refreshSettings,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      refreshSettings();
    }
  }, [isCartOpen, refreshSettings]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`cart-backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Order Cart"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <h2>Your Cart</h2>
            {totalCount > 0 && <span className="cart-header-badge">{totalCount} items</span>}
          </div>
          <button
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="cart-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🍽️</span>
              <h3>Your cart is empty</h3>
              <p>Explore our wide selection of delicious dishes and add your favourites!</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeCart();
                  navigate('/menu');
                }}
              >
                Explore Menu
              </Button>
            </div>
          ) : (
            <>
              {/* Minimum Order Alert */}
              {!meetsMinimum ? (
                <div className="cart-min-order-alert warning">
                  <span>⚠️</span>
                  <div>
                    Minimum order amount is <strong>₹{minOrderAmount}</strong>. Please add{' '}
                    <strong>₹{amountNeededForMinimum}</strong> more to proceed with delivery.
                  </div>
                </div>
              ) : (
                <div className="cart-min-order-alert success">
                  <span>✓</span>
                  <div>Minimum order met! Ready for Cash on Delivery.</div>
                </div>
              )}

              {/* Items List */}
              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-main">
                      <div className="cart-item-name-wrap">
                        <span className={`diet-indicator ${item.diet}`} />
                        <span className="cart-item-name">{item.name}</span>
                      </div>
                      <span className="cart-item-unit-price">₹{item.price} each</span>
                    </div>

                    <div className="cart-item-stepper">
                      <button
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease ${item.name}`}
                      >
                        –
                      </button>
                      <span className="cart-stepper-qty">{item.quantity}</span>
                      <button
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-line">
              <span>Item Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="cart-summary-line">
              <span>
                Delivery Fee {settings.delivery_radius_km ? `(~${settings.delivery_radius_km} KM)` : ''}
              </span>
              <span>
                {deliveryFee > 0 ? (
                  `₹${deliveryFee}`
                ) : settings.is_delivery_enabled ? (
                  <strong style={{ color: 'var(--color-success, #16a34a)' }}>FREE</strong>
                ) : (
                  'Not available'
                )}
              </span>
            </div>
            <div className="cart-summary-line total">
              <span>Grand Total</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal}</span>
            </div>

            <button
              className="cart-checkout-btn"
              disabled={!meetsMinimum || !settings.is_ordering_enabled}
              onClick={handleProceedToCheckout}
            >
              {!settings.is_ordering_enabled
                ? 'Online Ordering Closed'
                : !meetsMinimum
                ? `Add ₹${amountNeededForMinimum} more to order`
                : 'Proceed to Checkout (COD) →'}
            </button>

            {deliveryFee === 0 && (
              <div className="cart-delivery-note">
                🛵 <span>Delivery fee extra</span>
              </div>
            )}

            <button className="cart-clear-link" onClick={clearCart}>
              Clear Entire Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};
