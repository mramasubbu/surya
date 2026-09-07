-- ==============================================================================
-- SURYA MULTICUISINE RESTAURANT & CAFE
-- Migration: Online Ordering & Cash-on-Delivery System
-- Target: PostgreSQL / Supabase Free Tier
-- ==============================================================================

-- 1. ORDER NUMBER SEQUENCE (e.g. SURYA-1001, SURYA-1002...)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- 2. RESTAURANT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_ordering_enabled BOOLEAN NOT NULL DEFAULT true,
  is_delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 200.00 CHECK (min_order_amount >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  delivery_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 3.00 CHECK (delivery_radius_km >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  restaurant_email TEXT NOT NULL DEFAULT 'suryamulticuisine@gmail.com',
  customer_email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  landmark TEXT,
  pincode TEXT NOT NULL,
  customer_notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online', 'upi', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered')),
  order_source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ORDER ITEMS TABLE (Snapshot of ordered items)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price NUMERIC(10, 2) NOT NULL CHECK (item_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ORDER STATUS HISTORY (Audit trail & notification deduplication)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TRIGGERS FOR AUTO UPDATED_AT
DROP TRIGGER IF EXISTS trigger_restaurant_settings_updated_at ON public.restaurant_settings;
CREATE TRIGGER trigger_restaurant_settings_updated_at
BEFORE UPDATE ON public.restaurant_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders(access_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);

-- 8. INITIAL SEED FOR SETTINGS
INSERT INTO public.restaurant_settings (
  id,
  is_ordering_enabled,
  is_delivery_enabled,
  min_order_amount,
  delivery_fee,
  delivery_radius_km,
  currency,
  restaurant_email,
  customer_email_notifications
) VALUES (
  'default',
  true,
  true,
  200.00,
  0.00,
  3.00,
  'INR',
  'suryamulticuisine@gmail.com',
  true
) ON CONFLICT (id) DO NOTHING;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 9.1 RESTAURANT SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can read restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Public can read restaurant settings"
  ON public.restaurant_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can update restaurant settings"
  ON public.restaurant_settings FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Admins can insert restaurant settings"
  ON public.restaurant_settings FOR INSERT
  WITH CHECK (public.is_admin());

-- 9.2 ORDERS POLICIES
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- 9.3 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update order items" ON public.order_items;
CREATE POLICY "Admins can update order items"
  ON public.order_items FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items"
  ON public.order_items FOR DELETE
  USING (public.is_admin());

-- 9.4 ORDER STATUS HISTORY POLICIES
DROP POLICY IF EXISTS "Admins can view status history" ON public.order_status_history;
CREATE POLICY "Admins can view status history"
  ON public.order_status_history FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert status history" ON public.order_status_history;
CREATE POLICY "Admins can insert status history"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_admin());


-- ==============================================================================
-- 10. SERVER-SIDE ORDER CREATION & VALIDATION (SECURITY DEFINER)
-- Ensures client CANNOT tamper with prices, subtotals, or delivery fees!
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_online_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_delivery_address TEXT,
  p_landmark TEXT,
  p_pincode TEXT,
  p_customer_notes TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings RECORD;
  v_item JSONB;
  v_menu_item RECORD;
  v_subtotal NUMERIC(10, 2) := 0;
  v_delivery_fee NUMERIC(10, 2) := 0;
  v_total_amount NUMERIC(10, 2) := 0;
  v_order_number TEXT;
  v_access_token TEXT;
  v_order_id UUID;
  v_qty INTEGER;
  v_line_total NUMERIC(10, 2);
  v_items_count INTEGER := 0;
  v_items_snapshot JSONB := '[]'::JSONB;
BEGIN
  -- 1. Check if settings exist and ordering is enabled
  SELECT * INTO v_settings FROM public.restaurant_settings WHERE id = 'default';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant settings not found. Please contact administration.';
  END IF;

  IF NOT v_settings.is_ordering_enabled THEN
    RAISE EXCEPTION 'Online ordering is currently closed. Please call the restaurant directly.';
  END IF;

  IF NOT v_settings.is_delivery_enabled THEN
    RAISE EXCEPTION 'Home delivery is currently unavailable. Please call for takeaway.';
  END IF;

  -- 2. Validate basic input fields
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Please provide a valid customer name.';
  END IF;

  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 10 THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit mobile number.';
  END IF;

  IF p_delivery_address IS NULL OR length(trim(p_delivery_address)) < 5 THEN
    RAISE EXCEPTION 'Please provide a complete delivery address.';
  END IF;

  IF p_pincode IS NULL OR length(trim(p_pincode)) < 6 THEN
    RAISE EXCEPTION 'Please provide a valid pincode.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your order cart is empty. Please select dishes from the menu.';
  END IF;

  -- 3. Process and recalculate all items from DATABASE (Never trust frontend price!)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    IF v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Look up authentic menu item from database
    SELECT id, name, price, is_available, is_active
    INTO v_menu_item
    FROM public.menu_items
    WHERE id = (v_item->>'menu_item_id')::UUID;

    IF NOT FOUND OR NOT v_menu_item.is_active THEN
      RAISE EXCEPTION 'Item "%" is not currently active on our menu.', COALESCE(v_item->>'name', 'Unknown');
    END IF;

    IF NOT v_menu_item.is_available THEN
      RAISE EXCEPTION 'Sorry, "%" is sold out for today.', v_menu_item.name;
    END IF;

    v_line_total := v_menu_item.price * v_qty;
    v_subtotal := v_subtotal + v_line_total;
    v_items_count := v_items_count + 1;

    -- Store verified snapshot for bulk insertion
    v_items_snapshot := v_items_snapshot || jsonb_build_object(
      'menu_item_id', v_menu_item.id,
      'name', v_menu_item.name,
      'price', v_menu_item.price,
      'quantity', v_qty,
      'line_total', v_line_total
    );
  END LOOP;

  IF v_items_count = 0 THEN
    RAISE EXCEPTION 'Your order must contain at least one valid item.';
  END IF;

  -- 4. Check minimum order requirement
  IF v_subtotal < v_settings.min_order_amount THEN
    RAISE EXCEPTION 'Minimum order amount is ₹%. Your current food total is ₹%. Please add ₹% more to continue.',
      v_settings.min_order_amount,
      v_subtotal,
      (v_settings.min_order_amount - v_subtotal);
  END IF;

  -- 5. Calculate delivery fee & grand total
  v_delivery_fee := v_settings.delivery_fee;
  v_total_amount := v_subtotal + v_delivery_fee;

  -- 6. Generate order number & secure access token
  v_order_number := 'SURYA-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  v_access_token := encode(gen_random_bytes(24), 'hex');

  -- 7. Insert the Order record
  INSERT INTO public.orders (
    order_number,
    access_token,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    landmark,
    pincode,
    customer_notes,
    subtotal,
    delivery_fee,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    order_source
  ) VALUES (
    v_order_number,
    v_access_token,
    trim(p_customer_name),
    trim(p_customer_phone),
    trim(p_customer_email),
    trim(p_delivery_address),
    nullif(trim(p_landmark), ''),
    trim(p_pincode),
    nullif(trim(p_customer_notes), ''),
    v_subtotal,
    v_delivery_fee,
    v_total_amount,
    'cod',
    'pending',
    'pending',
    'website'
  )
  RETURNING id INTO v_order_id;

  -- 8. Insert Order Items snapshots
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_snapshot)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      menu_item_id,
      item_name,
      item_price,
      quantity,
      line_total
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::UUID,
      v_item->>'name',
      (v_item->>'price')::NUMERIC(10, 2),
      (v_item->>'quantity')::INTEGER,
      (v_item->>'line_total')::NUMERIC(10, 2)
    );
  END LOOP;

  -- 9. Insert initial status history
  INSERT INTO public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) VALUES (
    v_order_id,
    NULL,
    'pending',
    'customer',
    'Order placed via website (Cash on Delivery)'
  );

  -- 10. Return success response
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'access_token', v_access_token,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total_amount', v_total_amount,
    'payment_method', 'cod',
    'payment_status', 'pending',
    'order_status', 'pending',
    'created_at', now()
  );
END;
$$;


-- ==============================================================================
-- 11. SECURE GUEST ORDER TRACKING FUNCTION (SECURITY DEFINER)
-- Allows a guest customer to view ONLY their own order with access_token.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_order_by_token(
  p_order_number TEXT,
  p_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
  v_history JSONB;
BEGIN
  -- Look up order with matching order number and unguessable access_token
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE order_number = trim(p_order_number)
    AND access_token = trim(p_access_token);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found or unauthorized access token.');
  END IF;

  -- Fetch items
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'menu_item_id', menu_item_id,
      'item_name', item_name,
      'item_price', item_price,
      'quantity', quantity,
      'line_total', line_total
    ) ORDER BY created_at ASC
  ), '[]'::JSONB)
  INTO v_items
  FROM public.order_items
  WHERE order_id = v_order.id;

  -- Fetch status history
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'old_status', old_status,
      'new_status', new_status,
      'created_at', created_at,
      'notes', notes
    ) ORDER BY created_at ASC
  ), '[]'::JSONB)
  INTO v_history
  FROM public.order_status_history
  WHERE order_id = v_order.id;

  RETURN jsonb_build_object(
    'success', true,
    'order', jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'customer_phone', v_order.customer_phone,
      'customer_email', v_order.customer_email,
      'delivery_address', v_order.delivery_address,
      'landmark', v_order.landmark,
      'pincode', v_order.pincode,
      'customer_notes', v_order.customer_notes,
      'subtotal', v_order.subtotal,
      'delivery_fee', v_order.delivery_fee,
      'total_amount', v_order.total_amount,
      'payment_method', v_order.payment_method,
      'payment_status', v_order.payment_status,
      'order_status', v_order.order_status,
      'created_at', v_order.created_at,
      'updated_at', v_order.updated_at
    ),
    'items', v_items,
    'history', v_history
  );
END;
$$;


-- ==============================================================================
-- 12. ADMIN ORDER STATUS PROGRESSION FUNCTION (SECURITY DEFINER)
-- Validates admin permission, transitions status, and logs history.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
  v_updated_order RECORD;
BEGIN
  -- Verify admin status
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  -- Validate status
  IF p_new_status NOT IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered') THEN
    RAISE EXCEPTION 'Invalid order status: %', p_new_status;
  END IF;

  -- Get current status
  SELECT order_status INTO v_old_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- If status hasn't changed, do nothing
  IF v_old_status = p_new_status THEN
    RETURN jsonb_build_object('success', true, 'message', 'Status unchanged.');
  END IF;

  -- Update order
  UPDATE public.orders
  SET order_status = p_new_status,
      updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_updated_order;

  -- Log in status history
  INSERT INTO public.order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) VALUES (
    p_order_id,
    v_old_status,
    p_new_status,
    'admin',
    p_notes
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_updated_order.id,
    'order_number', v_updated_order.order_number,
    'old_status', v_old_status,
    'new_status', p_new_status,
    'updated_at', v_updated_order.updated_at
  );
END;
$$;
