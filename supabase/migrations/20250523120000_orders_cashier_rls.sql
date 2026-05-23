-- Cashier attribution, sales history summary RPC, and orders RLS.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cashier_user_id uuid REFERENCES public.users (id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS orders_cashier_user_idx ON public.orders (cashier_user_id);

-- Best-effort backfill from order-create audit logs (legacy POS used customer_id as actor).
UPDATE public.orders o
SET cashier_user_id = al.actor_user_id
FROM public.audit_logs al
WHERE al.entity_name = 'orders'
  AND al.action = 'create'
  AND al.entity_id = o.id
  AND o.cashier_user_id IS NULL;

-- Replace create_order_atomic to persist cashier_user_id.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_order_number text,
  p_customer_id uuid,
  p_source order_source,
  p_subtotal_amount numeric,
  p_tax_amount numeric,
  p_discount_amount numeric,
  p_total_amount numeric,
  p_items jsonb,
  p_payment_provider payment_provider,
  p_payment_method payment_method,
  p_payment_amount numeric,
  p_payment_status payment_status,
  p_transaction_id text,
  p_payment_metadata jsonb,
  p_invoice_number text,
  p_invoice_pdf_url text,
  p_actor_user_id uuid,
  p_cashier_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_inv inventory%ROWTYPE;
  v_order orders%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_invoice invoices%ROWTYPE;
  v_sales_log sales_logs%ROWTYPE;
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'ORDER_ITEMS_REQUIRED';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    SELECT * INTO v_inv
    FROM inventory
    WHERE product_id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVENTORY_NOT_FOUND:%', v_product_id;
    END IF;

    IF v_inv.stock_quantity < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_product_id;
    END IF;
  END LOOP;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    UPDATE inventory
    SET
      stock_quantity = stock_quantity - v_quantity,
      updated_at = now()
    WHERE product_id = v_product_id
      AND stock_quantity >= v_quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVENTORY_DECREMENT_FAILED:%', v_product_id;
    END IF;
  END LOOP;

  INSERT INTO orders (
    order_number,
    customer_id,
    cashier_user_id,
    source,
    subtotal_amount,
    tax_amount,
    discount_amount,
    total_amount
  )
  VALUES (
    p_order_number,
    p_customer_id,
    p_cashier_user_id,
    p_source,
    p_subtotal_amount,
    p_tax_amount,
    p_discount_amount,
    p_total_amount
  )
  RETURNING * INTO v_order;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      unit_price_snapshot,
      tax_percentage_snapshot,
      line_subtotal
    )
    VALUES (
      v_order.id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price_snapshot')::numeric,
      COALESCE((v_item->>'tax_percentage_snapshot')::numeric, 0),
      (v_item->>'line_subtotal')::numeric
    );
  END LOOP;

  INSERT INTO payments (
    order_id,
    provider,
    method,
    amount,
    status,
    transaction_id,
    metadata,
    paid_at
  )
  VALUES (
    v_order.id,
    p_payment_provider,
    p_payment_method,
    p_payment_amount,
    p_payment_status,
    p_transaction_id,
    p_payment_metadata,
    CASE WHEN p_payment_status = 'paid' THEN now() ELSE NULL END
  )
  RETURNING * INTO v_payment;

  INSERT INTO invoices (invoice_number, order_id, pdf_url)
  VALUES (p_invoice_number, v_order.id, p_invoice_pdf_url)
  RETURNING * INTO v_invoice;

  INSERT INTO sales_logs (source, order_id, total_amount, tax_amount, discount_amount)
  VALUES (p_source, v_order.id, p_total_amount, p_tax_amount, p_discount_amount)
  RETURNING * INTO v_sales_log;

  INSERT INTO audit_logs (
    entity_name,
    entity_id,
    action,
    actor_user_id,
    after_state
  )
  VALUES (
    'orders',
    v_order.id,
    'create',
    p_actor_user_id,
    jsonb_build_object(
      'orderId', v_order.id,
      'paymentId', v_payment.id,
      'invoiceId', v_invoice.id,
      'cashierUserId', p_cashier_user_id
    )
  );

  RETURN jsonb_build_object(
    'order', to_jsonb(v_order),
    'payment', to_jsonb(v_payment),
    'invoice', to_jsonb(v_invoice),
    'sales_log', to_jsonb(v_sales_log)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_atomic TO authenticated, service_role;

-- Aggregated KPIs for sales history (matches list filters; revenue counts paid orders only).
CREATE OR REPLACE FUNCTION public.sales_history_summary(
  p_from timestamptz,
  p_to timestamptz,
  p_cashier_user_id uuid DEFAULT NULL,
  p_payment_status payment_status DEFAULT NULL,
  p_order_status_filter text DEFAULT NULL,
  p_search text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_search text;
  v_orders_count bigint;
  v_paid_orders_count bigint;
  v_total_revenue numeric;
  v_todays_sales numeric;
  v_today_start timestamptz;
BEGIN
  v_search := NULLIF(trim(p_search), '');
  v_today_start := date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';

  SELECT
    count(*)::bigint,
    count(*) FILTER (WHERE o.payment_status = 'paid')::bigint,
    coalesce(sum(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0),
    coalesce(
      sum(
        CASE
          WHEN o.payment_status = 'paid' AND o.placed_at >= v_today_start THEN o.total_amount
          ELSE 0
        END
      ),
      0
    )
  INTO v_orders_count, v_paid_orders_count, v_total_revenue, v_todays_sales
  FROM orders o
  WHERE o.deleted_at IS NULL
    AND o.placed_at >= p_from
    AND o.placed_at <= p_to
    AND (p_cashier_user_id IS NULL OR o.cashier_user_id = p_cashier_user_id)
    AND (p_payment_status IS NULL OR o.payment_status = p_payment_status)
    AND (
      p_order_status_filter IS NULL
      OR (p_order_status_filter = 'cancelled' AND o.status = 'cancelled')
      OR (p_order_status_filter = 'refunded' AND o.status = 'refunded')
      OR (
        p_order_status_filter = 'completed'
        AND o.status IN ('paid', 'processing', 'delivered')
      )
    )
    AND (
      v_search IS NULL
      OR o.order_number ILIKE '%' || v_search || '%'
      OR EXISTS (
        SELECT 1 FROM invoices i
        WHERE i.order_id = o.id AND i.invoice_number ILIKE '%' || v_search || '%'
      )
      OR EXISTS (
        SELECT 1 FROM payments p
        WHERE p.order_id = o.id AND p.transaction_id ILIKE '%' || v_search || '%'
      )
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = o.customer_id
          AND (u.email ILIKE '%' || v_search || '%' OR u.full_name ILIKE '%' || v_search || '%')
      )
    );

  RETURN jsonb_build_object(
    'ordersCount', v_orders_count,
    'totalRevenue', v_total_revenue,
    'todaysSales', v_todays_sales,
    'averageOrderValue', CASE
      WHEN v_paid_orders_count > 0 THEN v_total_revenue / v_paid_orders_count::numeric
      ELSE 0
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sales_history_summary TO authenticated, service_role;

-- RLS on orders (defense in depth; server uses authenticated client for reads).
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_select_admin ON public.orders;
DROP POLICY IF EXISTS orders_select_cashier ON public.orders;
DROP POLICY IF EXISTS orders_select_customer ON public.orders;

CREATE POLICY orders_select_admin ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.is_active = true
    )
  );

CREATE POLICY orders_select_cashier ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'cashier' AND u.is_active = true
    )
    AND cashier_user_id = auth.uid()
  );

CREATE POLICY orders_select_customer ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());
