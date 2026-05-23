import type { Database } from "@/types/supabase";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type CartRow = Database["public"]["Tables"]["carts"]["Row"];
type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export function toMoneyString(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "0.00";
  }
  return Number(value).toFixed(2);
}

export function toMoneyNumber(value: string | number): number {
  return Number(value);
}

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

type ProductListFields = Pick<
  ProductRow,
  "id" | "name" | "description" | "image_url" | "category_id" | "sale_price" | "is_active" | "created_at" | "updated_at"
>;

export function mapProductItem(
  product: ProductListFields,
  category?: Pick<CategoryRow, "name"> | null,
): {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  salePrice: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.image_url,
    categoryId: product.category_id,
    categoryName: category?.name ?? null,
    salePrice: toMoneyString(product.sale_price),
    isActive: product.is_active,
    createdAt: toDate(product.created_at),
    updatedAt: toDate(product.updated_at),
  };
}

type StorefrontProductFields = Pick<
  ProductRow,
  "id" | "name" | "description" | "image_url" | "category_id" | "sale_price" | "is_active"
>;

export function mapStorefrontProduct(
  product: StorefrontProductFields,
  inventoryRow?: Pick<InventoryRow, "stock_quantity" | "low_stock_threshold"> | null,
  category?: Pick<CategoryRow, "name"> | null,
) {
  const stockQuantity = inventoryRow?.stock_quantity ?? 0;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.image_url,
    categoryId: product.category_id,
    categoryName: category?.name ?? null,
    salePrice: toMoneyString(product.sale_price),
    isActive: product.is_active,
    stockQuantity,
    lowStockThreshold: inventoryRow?.low_stock_threshold ?? 0,
    inStock: stockQuantity > 0,
  };
}

export function mapInventoryRow(row: InventoryRow) {
  return {
    id: row.id,
    productId: row.product_id,
    stockQuantity: row.stock_quantity,
    reservedStock: row.reserved_stock,
    lowStockThreshold: row.low_stock_threshold,
    updatedBy: row.updated_by,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapOrderRow(row: OrderRow) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    source: row.source,
    status: row.status,
    paymentStatus: row.payment_status,
    couponId: row.coupon_id,
    subtotalAmount: toMoneyString(row.subtotal_amount),
    taxAmount: toMoneyString(row.tax_amount),
    discountAmount: toMoneyString(row.discount_amount),
    totalAmount: toMoneyString(row.total_amount),
    notes: row.notes,
    metadata: row.metadata,
    placedAt: toDate(row.placed_at),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
    deletedAt: row.deleted_at ? toDate(row.deleted_at) : null,
  };
}

export function mapOrderItemRow(row: OrderItemRow) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPriceSnapshot: toMoneyString(row.unit_price_snapshot),
    taxPercentageSnapshot: toMoneyString(row.tax_percentage_snapshot),
    lineSubtotal: toMoneyString(row.line_subtotal),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapPaymentRow(row: PaymentRow) {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    method: row.method,
    amount: toMoneyString(row.amount),
    status: row.status,
    transactionId: row.transaction_id,
    metadata: row.metadata,
    paidAt: row.paid_at ? toDate(row.paid_at) : null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapInvoiceRow(row: InvoiceRow) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    orderId: row.order_id,
    pdfUrl: row.pdf_url,
    generatedAt: toDate(row.generated_at),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapCartRow(row: CartRow) {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    status: row.status,
    expiresAt: row.expires_at ? toDate(row.expires_at) : null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapCartItemRow(row: CartItemRow) {
  return {
    id: row.id,
    cartId: row.cart_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: toMoneyString(row.unit_price),
    taxPercentage: toMoneyString(row.tax_percentage),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function mapAuditLogRow(row: AuditLogRow) {
  return {
    id: row.id,
    entityName: row.entity_name,
    entityId: row.entity_id,
    action: row.action,
    actorUserId: row.actor_user_id,
    beforeState: row.before_state,
    afterState: row.after_state,
    metadata: row.metadata,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
