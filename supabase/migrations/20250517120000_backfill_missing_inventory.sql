-- Backfill inventory rows for active products that were inserted without inventory.
INSERT INTO inventory (product_id, stock_quantity, reserved_stock, low_stock_threshold)
SELECT
  p.id,
  0,
  0,
  5
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
WHERE i.id IS NULL
  AND p.deleted_at IS NULL;
