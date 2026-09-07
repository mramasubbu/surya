import type { OrderRow, OrderItemRow, OrderStatus } from '../types/database';

export type EmailEventType = 'NEW_ORDER_CUSTOMER' | 'NEW_ORDER_RESTAURANT' | 'STATUS_UPDATE';

interface SendOrderEmailPayload {
  type: EmailEventType;
  order: OrderRow;
  items: OrderItemRow[];
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
}

/**
 * Dispatch email notification via Netlify serverless function
 * Fully decoupled: Errors are logged but never interrupt the ordering process.
 */
export const sendOrderEmailNotification = async (
  payload: SendOrderEmailPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/.netlify/functions/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Email notification function responded with status:', response.status, errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (err: unknown) {
    // Gracefully catch network / function offline errors
    const msg = err instanceof Error ? err.message : 'Notification service unreachable';
    console.warn('Decoupled email notification dispatch (non-blocking):', msg);
    return { success: false, error: msg };
  }
};
