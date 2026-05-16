-- Atomic backend operations (Supabase RPC)
-- Apply via Supabase CLI or SQL editor.

CREATE OR REPLACE FUNCTION public.create_product_with_inventory(
  p_category_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_image_url text,
  p_sale_price numeric,
  p_is_active boolean,
  p_actor_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_inventory inventory%ROWTYPE;
BEGIN
  INSERT INTO products (
    category_id,
    name,
    slug,
    description,
    image_url,
    sale_price,
    is_active
  )
  VALUES (
    p_category_id,
    p_name,
    p_slug,
    p_description,
    p_image_url,
    p_sale_price,
    p_is_active
  )
  RETURNING * INTO v_product;

  INSERT INTO inventory (product_id, stock_quantity, reserved_stock, updated_by)
  VALUES (v_product.id, 0, 0, p_actor_user_id)
  RETURNING * INTO v_inventory;

  INSERT INTO inventory_logs (
    product_id,
    source,
    reason,
    quantity_before,
    quantity_change,
    quantity_after,
    notes,
    actor_user_id
  )
  VALUES (
    v_product.id,
    'manual_adjustment',
    'adjustment',
    0,
    0,
    0,
    'Inventory initialized on product creation.',
    p_actor_user_id
  );

  INSERT INTO audit_logs (
    entity_name,
    entity_id,
    action,
    actor_user_id,
    after_state
  )
  VALUES (
    'products',
    v_product.id,
    'create',
    p_actor_user_id,
    jsonb_build_object(
      'productId', v_product.id,
      'inventoryId', v_inventory.id
    )
  );

  RETURN jsonb_build_object(
    'product', to_jsonb(v_product),
    'inventory', to_jsonb(v_inventory)
  );
END;
$$;

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
  p_actor_user_id uuid
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
    source,
    subtotal_amount,
    tax_amount,
    discount_amount,
    total_amount
  )
  VALUES (
    p_order_number,
    p_customer_id,
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
      'invoiceId', v_invoice.id
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

CREATE OR REPLACE FUNCTION public.adjust_inventory_atomic(
  p_operation text,
  p_product_id uuid,
  p_actor_user_id uuid DEFAULT NULL,
  p_quantity integer DEFAULT NULL,
  p_new_stock_quantity integer DEFAULT NULL,
  p_source inventory_source DEFAULT NULL,
  p_reason inventory_reason DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_reference_order_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv inventory%ROWTYPE;
  v_before_stock integer;
  v_before_reserved integer;
  v_quantity_change integer := 0;
  v_log_reason inventory_reason;
  v_log_source inventory_source;
  v_release_quantity integer;
  v_new_reserved integer;
BEGIN
  SELECT * INTO v_inv
  FROM inventory
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVENTORY_NOT_FOUND';
  END IF;

  v_before_stock := v_inv.stock_quantity;
  v_before_reserved := v_inv.reserved_stock;

  IF p_operation = 'validate' THEN
    IF v_inv.stock_quantity < COALESCE(p_quantity, 0) THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

    RETURN jsonb_build_object(
      'inventory', to_jsonb(v_inv)
    );
  END IF;

  IF p_operation = 'decrement' THEN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    IF v_inv.stock_quantity < p_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK';
    END IF;

    UPDATE inventory
    SET
      stock_quantity = stock_quantity - p_quantity,
      updated_by = p_actor_user_id,
      updated_at = now()
    WHERE product_id = p_product_id
      AND stock_quantity >= p_quantity
    RETURNING * INTO v_inv;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVENTORY_DECREMENT_FAILED';
    END IF;

    v_quantity_change := -p_quantity;
    v_log_reason := COALESCE(p_reason, 'sale');
    v_log_source := COALESCE(p_source, 'manual_adjustment');
  ELSIF p_operation = 'increment' THEN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    UPDATE inventory
    SET
      stock_quantity = stock_quantity + p_quantity,
      updated_by = p_actor_user_id,
      updated_at = now()
    WHERE product_id = p_product_id
    RETURNING * INTO v_inv;

    v_quantity_change := p_quantity;
    v_log_reason := COALESCE(p_reason, 'restock');
    v_log_source := COALESCE(p_source, 'manual_adjustment');
  ELSIF p_operation = 'adjust' THEN
    IF p_new_stock_quantity IS NULL OR p_new_stock_quantity < 0 THEN
      RAISE EXCEPTION 'INVALID_STOCK_QUANTITY';
    END IF;

    v_quantity_change := p_new_stock_quantity - v_inv.stock_quantity;
    v_new_reserved := LEAST(v_inv.reserved_stock, p_new_stock_quantity);

    UPDATE inventory
    SET
      stock_quantity = p_new_stock_quantity,
      reserved_stock = v_new_reserved,
      updated_by = p_actor_user_id,
      updated_at = now()
    WHERE product_id = p_product_id
    RETURNING * INTO v_inv;

    v_log_reason := COALESCE(p_reason, 'adjustment');
    v_log_source := COALESCE(p_source, 'manual_adjustment');
  ELSIF p_operation = 'reserve' THEN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    IF (v_inv.stock_quantity - v_inv.reserved_stock) < p_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_AVAILABLE_STOCK';
    END IF;

    UPDATE inventory
    SET
      reserved_stock = reserved_stock + p_quantity,
      updated_by = p_actor_user_id,
      updated_at = now()
    WHERE product_id = p_product_id
    RETURNING * INTO v_inv;

    v_quantity_change := 0;
    v_log_reason := 'adjustment';
    v_log_source := COALESCE(p_source, 'manual_adjustment');
    p_notes := COALESCE(p_notes, format('Reserved quantity increased by %s.', p_quantity));
  ELSIF p_operation = 'release' THEN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    v_release_quantity := LEAST(p_quantity, v_inv.reserved_stock);

    UPDATE inventory
    SET
      reserved_stock = reserved_stock - v_release_quantity,
      updated_by = p_actor_user_id,
      updated_at = now()
    WHERE product_id = p_product_id
    RETURNING * INTO v_inv;

    v_quantity_change := 0;
    v_log_reason := 'adjustment';
    v_log_source := COALESCE(p_source, 'manual_adjustment');
    p_notes := COALESCE(p_notes, format('Reserved quantity released by %s.', v_release_quantity));
  ELSE
    RAISE EXCEPTION 'INVALID_OPERATION';
  END IF;

  INSERT INTO inventory_logs (
    product_id,
    source,
    reason,
    quantity_before,
    quantity_change,
    quantity_after,
    actor_user_id,
    notes,
    reference_order_id
  )
  VALUES (
    p_product_id,
    v_log_source,
    v_log_reason,
    v_before_stock,
    v_quantity_change,
    v_inv.stock_quantity,
    p_actor_user_id,
    p_notes,
    p_reference_order_id
  );

  INSERT INTO audit_logs (
    entity_name,
    entity_id,
    action,
    actor_user_id,
    before_state,
    after_state
  )
  VALUES (
    'inventory',
    v_inv.id,
    'update',
    p_actor_user_id,
    jsonb_build_object(
      'stockQuantity', v_before_stock,
      'reservedStock', v_before_reserved
    ),
    jsonb_build_object(
      'stockQuantity', v_inv.stock_quantity,
      'reservedStock', v_inv.reserved_stock
    )
  );

  RETURN jsonb_build_object(
    'inventory', to_jsonb(v_inv)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_product_with_inventory TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_order_atomic TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.adjust_inventory_atomic TO authenticated, service_role;
