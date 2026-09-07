import type { Context } from '@netlify/functions';

interface OrderItem {
  item_name: string;
  item_price: number;
  quantity: number;
  line_total: number;
}

interface OrderEmailRequest {
  type: 'NEW_ORDER_CUSTOMER' | 'NEW_ORDER_RESTAURANT' | 'STATUS_UPDATE';
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_address: string;
    landmark?: string | null;
    pincode: string;
    customer_notes?: string | null;
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    created_at: string;
    access_token?: string;
  };
  items: OrderItem[];
  previousStatus?: string;
  newStatus?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async (req: Request, _context: Context): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: OrderEmailRequest = await req.json();
    const { type, order, items } = payload;

    if (!order || !order.order_number) {
      return new Response(JSON.stringify({ error: 'Invalid order payload' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'orders@suryamulticuisine.com';
    const restaurantEmail =
      process.env.RESTAURANT_NOTIFICATION_EMAIL || 'suryamulticuisine@gmail.com';

    let to = order.customer_email;
    let subject = '';
    let htmlContent = '';

    const itemsTableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-family: sans-serif; font-size: 14px;">
        <thead>
          <tr style="background-color: #f3f4f6; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Dish</th>
            <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Price</th>
            <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(items || [])
            .map(
              (i) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${i.item_name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${i.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${i.item_price}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">₹${i.line_total}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; color: #4b5563;">Subtotal:</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">₹${order.subtotal}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; color: #4b5563;">Delivery Fee:</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">₹${order.delivery_fee}</td>
          </tr>
          <tr style="background-color: #fef3c7;">
            <td colspan="3" style="padding: 12px; text-align: right; font-weight: 700; font-size: 16px; color: #92400e;">Grand Total (Cash on Delivery):</td>
            <td style="padding: 12px; text-align: right; font-weight: 800; font-size: 18px; color: #92400e;">₹${order.total_amount}</td>
          </tr>
        </tfoot>
      </table>
    `;

    if (type === 'NEW_ORDER_CUSTOMER') {
      to = order.customer_email;
      subject = `Order Confirmed #${order.order_number} — Surya Restaurant`;
      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #12121E 0%, #1c1c2e 100%); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; color: #E8722A; font-size: 24px; letter-spacing: 0.5px;">Surya Multicuisine Restaurant</h1>
            <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 14px;">Ambattur, Chennai • +91 80155 53780</p>
          </div>
          
          <div style="padding: 24px;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 4px 0; color: #065f46; font-size: 18px;">✓ Order Placed Successfully!</h2>
              <p style="margin: 0; color: #047857; font-size: 14px;">Thank you, <strong>${order.customer_name}</strong>. Your order has been received and is being processed.</p>
            </div>

            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Order Number:</strong> <span style="color: #E8722A; font-weight: bold;">${order.order_number}</span></p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Payment Mode:</strong> Cash on Delivery (COD)</p>
            <p style="margin: 0 0 16px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.delivery_address}${order.landmark ? ', ' + order.landmark : ''} - ${order.pincode}</p>

            <h3 style="margin: 20px 0 8px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Your Dishes</h3>
            ${itemsTableHtml}

            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 13px; color: #92400e;">
              💵 <strong>Cash on Delivery Reminder:</strong> Please keep the exact cash amount of <strong>₹${order.total_amount}</strong> ready upon delivery.
            </div>

            <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 24px;">
              Questions? Call us directly at <a href="tel:+918015553780" style="color: #E8722A; text-decoration: none; font-weight: 600;">+91 80155 53780</a>.
            </p>
          </div>
        </div>
      `;
    } else if (type === 'NEW_ORDER_RESTAURANT') {
      to = restaurantEmail;
      subject = `🚨 NEW ORDER #${order.order_number} — ₹${order.total_amount} (COD)`;
      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #111827;">
          <div style="background: #dc2626; color: #ffffff; padding: 16px; border-radius: 6px 6px 0 0;">
            <h2 style="margin: 0;">🚨 New Website Order Received!</h2>
            <p style="margin: 4px 0 0 0; font-size: 16px;"><strong>#${order.order_number}</strong> • Cash on Delivery: ₹${order.total_amount}</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 6px 6px;">
            <h3 style="margin-top: 0;">Customer Details</h3>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customer_name}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${order.customer_phone}">${order.customer_phone}</a></p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customer_email}</p>
            <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            ${order.landmark ? `<p style="margin: 4px 0;"><strong>Landmark:</strong> ${order.landmark}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Pincode:</strong> ${order.pincode}</p>
            ${order.customer_notes ? `<p style="margin: 4px 0; color: #b45309;"><strong>Customer Note:</strong> ${order.customer_notes}</p>` : ''}

            <h3>Dishes Ordered</h3>
            ${itemsTableHtml}
          </div>
        </div>
      `;
    } else if (type === 'STATUS_UPDATE') {
      to = order.customer_email;
      const statusLabels: Record<string, string> = {
        confirmed: 'Confirmed & Sent to Kitchen',
        preparing: 'Being Prepared by our Chef',
        ready: 'Packed & Ready',
        out_for_delivery: 'Out for Delivery 🛵',
        delivered: 'Delivered — Enjoy Your Meal! 🍽️',
      };
      const statusTitle = statusLabels[order.order_status] || order.order_status;
      subject = `Order #${order.order_number} Update: ${statusTitle}`;
      htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: #12121E; padding: 20px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; color: #E8722A;">Surya Multicuisine Restaurant</h2>
          </div>
          <div style="padding: 24px;">
            <h3 style="margin-top: 0; color: #E8722A;">Order Status: ${statusTitle}</h3>
            <p>Hello ${order.customer_name},</p>
            <p>Your order <strong>#${order.order_number}</strong> status has been updated to: <strong>${statusTitle}</strong>.</p>
            ${
              order.order_status === 'out_for_delivery'
                ? `<p style="background: #eff6ff; padding: 12px; border-radius: 6px; border: 1px solid #bfdbfe;">🛵 Our delivery partner is on the way to your address. Please keep <strong>₹${order.total_amount}</strong> cash ready.</p>`
                : ''
            }
            ${
              order.order_status === 'delivered'
                ? `<p style="background: #ecfdf5; padding: 12px; border-radius: 6px; border: 1px solid #a7f3d0;">🎉 Your order has been delivered! We hope you love your food. Thank you for dining with Surya Restaurant!</p>`
                : ''
            }
            <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">Need assistance? Call us at <a href="tel:+918015553780">+91 80155 53780</a>.</p>
          </div>
        </div>
      `;
    }

    // Send via Resend if API key is provided
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      const resendData = await resendRes.json();
      return new Response(
        JSON.stringify({ success: resendRes.ok, data: resendData }),
        { status: resendRes.ok ? 200 : 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback when Resend key is not yet configured: Log safely
    console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
    return new Response(
      JSON.stringify({
        success: true,
        mocked: true,
        message: 'Email simulated successfully (add RESEND_API_KEY to send live emails).',
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email error';
    console.error('send-order-email error:', err);
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
};
