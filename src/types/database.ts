export type DietType = 'veg' | 'non-veg' | 'egg';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type ContactMessageStatus = 'unread' | 'read' | 'resolved';
export type AdminRole = 'admin' | 'superadmin';

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  price_label: string | null;
  diet: DietType;
  image_url: string | null;
  is_popular: boolean;
  is_available: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  discount_tag: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRow {
  id: string;
  role: AdminRole;
  created_at: string;
}

// Joined types for UI consumption
export interface CategoryWithItems extends CategoryRow {
  items: MenuItemRow[];
}

// Online Ordering & COD Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered';

export type PaymentMethod = 'cod' | 'online' | 'upi' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface RestaurantSettingsRow {
  id: string;
  is_ordering_enabled: boolean;
  is_delivery_enabled: boolean;
  min_order_amount: number;
  delivery_fee: number;
  delivery_radius_km: number;
  currency: string;
  restaurant_email: string;
  customer_email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  access_token: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  landmark: string | null;
  pincode: string;
  customer_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  order_source: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  line_total: number;
  created_at?: string;
}

export interface OrderStatusHistoryRow {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  notes: string | null;
  created_at: string;
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
  history?: OrderStatusHistoryRow[];
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  landmark?: string;
  pincode: string;
  customer_notes?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    name?: string;
    price?: number;
  }[];
}
