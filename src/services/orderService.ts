import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  CreateOrderPayload,
  OrderRow,
  OrderItemRow,
  OrderStatusHistoryRow,
  OrderStatus,
  OrderWithItems,
} from '../types/database';
import { fetchRestaurantSettings } from './settingsService';

const LOCAL_ORDERS_KEY = 'surya_demo_orders_store';

interface LocalStoreData {
  order: OrderRow;
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
}

const getLocalOrders = (): LocalStoreData[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalOrder = (data: LocalStoreData) => {
  try {
    const all = getLocalOrders();
    all.unshift(data);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage limits
  }
};

const updateLocalOrderStatus = (orderId: string, newStatus: OrderStatus, notes?: string): boolean => {
  try {
    const all = getLocalOrders();
    const target = all.find((o) => o.order.id === orderId);
    if (!target) return false;
    const oldStatus = target.order.order_status;
    target.order.order_status = newStatus;
    target.order.updated_at = new Date().toISOString();
    target.history.push({
      id: 'hist-' + Date.now(),
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: 'admin',
      notes: notes || null,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
};

export interface CreateOrderResult {
  success: boolean;
  order_id: string;
  order_number: string;
  access_token: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  created_at: string;
  items?: OrderItemRow[];
}

/**
 * Public: Create an online order with server-side / RPC validation
 */
export const createOnlineOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResult> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('create_online_order', {
        p_customer_name: payload.customer_name.trim(),
        p_customer_phone: payload.customer_phone.trim(),
        p_customer_email: payload.customer_email.trim(),
        p_delivery_address: payload.delivery_address.trim(),
        p_landmark: payload.landmark?.trim() || null,
        p_pincode: payload.pincode.trim(),
        p_customer_notes: payload.customer_notes?.trim() || null,
        p_items: payload.items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      });

      if (error) {
        // If it's a validation error raised from the database function
        if (error.message && !error.message.includes('function') && !error.message.includes('schema cache')) {
          throw new Error(error.message);
        }
        console.warn('RPC create_online_order failed or not yet installed in Supabase:', error.message);
      } else if (data && data.success) {
        return {
          success: true,
          order_id: data.order_id,
          order_number: data.order_number,
          access_token: data.access_token,
          subtotal: Number(data.subtotal),
          delivery_fee: Number(data.delivery_fee),
          total_amount: Number(data.total_amount),
          payment_method: data.payment_method || 'cod',
          payment_status: data.payment_status || 'pending',
          order_status: data.order_status || 'pending',
          created_at: data.created_at || new Date().toISOString(),
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('function') && !err.message.includes('schema cache')) {
        throw err;
      }
      console.warn('Could not call create_online_order RPC, evaluating fallback:', err);
    }
  }

  // Fallback order creation (e.g. while migration is pending execution in Supabase)
  const settings = await fetchRestaurantSettings();
  if (!settings.is_ordering_enabled) {
    throw new Error('Online ordering is currently closed. Please call the restaurant directly.');
  }
  if (!settings.is_delivery_enabled) {
    throw new Error('Home delivery is currently unavailable. Please call for takeaway.');
  }

  // Calculate items and subtotal safely
  let subtotal = 0;
  const itemsSnapshot: OrderItemRow[] = [];
  const orderId = 'ord-' + Date.now();

  for (const item of payload.items) {
    const qty = Number(item.quantity);
    if (qty <= 0) continue;
    const unitPrice = item.price || 0;
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    itemsSnapshot.push({
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      item_name: item.name || 'Dish Item',
      item_price: unitPrice,
      quantity: qty,
      line_total: lineTotal,
      created_at: new Date().toISOString(),
    });
  }

  if (subtotal < settings.min_order_amount) {
    throw new Error(
      `Minimum order amount is ₹${settings.min_order_amount}. Your current food total is ₹${subtotal}. Please add ₹${settings.min_order_amount - subtotal} more.`
    );
  }

  const deliveryFee = settings.delivery_fee;
  const totalAmount = subtotal + deliveryFee;
  const orderNumber = 'SURYA-' + (Math.floor(1000 + Math.random() * 9000));
  const accessToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

  const orderRecord: OrderRow = {
    id: orderId,
    order_number: orderNumber,
    access_token: accessToken,
    customer_name: payload.customer_name.trim(),
    customer_phone: payload.customer_phone.trim(),
    customer_email: payload.customer_email.trim(),
    delivery_address: payload.delivery_address.trim(),
    landmark: payload.landmark?.trim() || null,
    pincode: payload.pincode.trim(),
    customer_notes: payload.customer_notes?.trim() || null,
    subtotal,
    delivery_fee: deliveryFee,
    total_amount: totalAmount,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'pending',
    order_source: 'website',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const initialHistory: OrderStatusHistoryRow = {
    id: 'hist-' + Date.now(),
    order_id: orderId,
    old_status: null,
    new_status: 'pending',
    changed_by: 'customer',
    notes: 'Order placed via website (Cash on Delivery)',
    created_at: new Date().toISOString(),
  };

  saveLocalOrder({
    order: orderRecord,
    items: itemsSnapshot,
    history: [initialHistory],
  });

  return {
    success: true,
    order_id: orderId,
    order_number: orderNumber,
    access_token: accessToken,
    subtotal,
    delivery_fee: deliveryFee,
    total_amount: totalAmount,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'pending',
    created_at: orderRecord.created_at,
    items: itemsSnapshot,
  };
};

/**
 * Public: Fetch order and items using order_number and unguessable access_token
 */
export const fetchOrderByToken = async (
  orderNumber: string,
  accessToken: string
): Promise<{
  success: boolean;
  order: OrderRow;
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
} | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('get_order_by_token', {
        p_order_number: orderNumber.trim(),
        p_access_token: accessToken.trim(),
      });

      if (!error && data && data.success) {
        return {
          success: true,
          order: {
            ...data.order,
            subtotal: Number(data.order.subtotal),
            delivery_fee: Number(data.order.delivery_fee),
            total_amount: Number(data.order.total_amount),
          },
          items: (data.items || []).map((it: OrderItemRow) => ({
            ...it,
            item_price: Number(it.item_price),
            line_total: Number(it.line_total),
          })),
          history: data.history || [],
        };
      }
    } catch (err) {
      console.warn('Supabase fetchOrderByToken error, checking local store:', err);
    }
  }

  // Check local storage fallback
  const localOrders = getLocalOrders();
  const match = localOrders.find(
    (o) =>
      o.order.order_number.toUpperCase() === orderNumber.trim().toUpperCase() &&
      o.order.access_token === accessToken.trim()
  );

  if (match) {
    return {
      success: true,
      order: match.order,
      items: match.items,
      history: match.history,
    };
  }

  return null;
};

/**
 * Admin: Fetch all orders with filtering and search
 */
export const fetchAdminOrders = async (options?: {
  status?: OrderStatus | 'all';
  date?: 'all' | 'today' | 'yesterday';
  search?: string;
}): Promise<OrderWithItems[]> => {
  let orders: OrderWithItems[] = [];

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('order_status', options.status);
      }

      if (options?.date === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (options?.date === 'yesterday') {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        yest.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', yest.toISOString()).lt('created_at', today.toISOString());
      }

      const { data, error } = await query;
      if (!error && data) {
        orders = data.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          delivery_fee: Number(o.delivery_fee),
          total_amount: Number(o.total_amount),
          items: (o.items || []).map((it: OrderItemRow) => ({
            ...it,
            item_price: Number(it.item_price),
            line_total: Number(it.line_total),
          })),
        }));
      }
    } catch (err) {
      console.warn('Could not fetch orders from Supabase:', err);
    }
  }

  // Merge with local fallback orders (without duplicates)
  const localOrders = getLocalOrders();
  for (const lo of localOrders) {
    if (!orders.some((o) => o.id === lo.order.id || o.order_number === lo.order.order_number)) {
      orders.push({
        ...lo.order,
        items: lo.items,
        history: lo.history,
      });
    }
  }

  // Apply filters in memory if query didn't catch local ones
  if (options?.status && options.status !== 'all') {
    orders = orders.filter((o) => o.order_status === options.status);
  }

  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.delivery_address.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return orders;
};

/**
 * Admin: Update order status with audit log
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<{ success: boolean; message?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus,
        p_notes: notes || null,
      });

      if (error || !data?.success) {
        // Try direct update if RPC fails
        const { error: directError } = await supabase
          .from('orders')
          .update({
            order_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (!directError) {
          await supabase.from('order_status_history').insert([
            {
              order_id: orderId,
              new_status: newStatus,
              changed_by: 'admin',
              notes: notes || null,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('Supabase order status update failed:', err);
    }
  }

  // Also update local store
  updateLocalOrderStatus(orderId, newStatus, notes);

  return { success: true };
};
