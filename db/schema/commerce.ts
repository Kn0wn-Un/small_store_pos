import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./catalog";
import {
  auditActionEnum,
  cartStatusEnum,
  couponTypeEnum,
  orderSourceEnum,
  orderStatusEnum,
  paymentMethodEnum,
  paymentProviderEnum,
  paymentStatusEnum,
} from "./enums";
import { users } from "./users";

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    source: orderSourceEnum("source").default("ecommerce").notNull(),
    status: cartStatusEnum("status").default("active").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index("carts_user_idx").on(table.userId), index("carts_status_idx").on(table.status), index("carts_source_idx").on(table.source)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    taxPercentage: numeric("tax_percentage", { precision: 5, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("cart_items_cart_product_unique_idx").on(table.cartId, table.productId),
    index("cart_items_cart_idx").on(table.cartId),
    index("cart_items_product_idx").on(table.productId),
    check("cart_items_quantity_positive_chk", sql`${table.quantity} > 0`),
    check("cart_items_unit_price_non_negative_chk", sql`${table.unitPrice} >= 0`),
    check("cart_items_tax_range_chk", sql`${table.taxPercentage} >= 0 AND ${table.taxPercentage} <= 100`),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 80 }).notNull(),
    type: couponTypeEnum("type").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }).notNull(),
    maxDiscountAmount: numeric("max_discount_amount", { precision: 12, scale: 2 }),
    minOrderAmount: numeric("min_order_amount", { precision: 12, scale: 2 }),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").default(0).notNull(),
    perUserLimit: integer("per_user_limit"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("coupons_code_unique_idx").on(table.code),
    index("coupons_active_idx").on(table.isActive),
    index("coupons_expiry_idx").on(table.expiresAt),
    check("coupons_value_positive_chk", sql`${table.value} > 0`),
    check("coupons_usage_non_negative_chk", sql`${table.usageCount} >= 0`),
    check("coupons_limit_non_negative_chk", sql`${table.usageLimit} IS NULL OR ${table.usageLimit} >= 0`),
    check("coupons_validity_window_chk", sql`${table.expiresAt} IS NULL OR ${table.startsAt} IS NULL OR ${table.expiresAt} > ${table.startsAt}`),
  ],
);

// Orders are shared by POS + ecommerce and represent the canonical sale record.
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    customerId: uuid("customer_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    source: orderSourceEnum("source").notNull(),
    status: orderStatusEnum("status").default("pending").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null", onUpdate: "cascade" }),
    subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("orders_order_number_unique_idx").on(table.orderNumber),
    index("orders_customer_idx").on(table.customerId),
    index("orders_source_idx").on(table.source),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_placed_at_idx").on(table.placedAt),
    check("orders_subtotal_non_negative_chk", sql`${table.subtotalAmount} >= 0`),
    check("orders_tax_non_negative_chk", sql`${table.taxAmount} >= 0`),
    check("orders_discount_non_negative_chk", sql`${table.discountAmount} >= 0`),
    check("orders_total_non_negative_chk", sql`${table.totalAmount} >= 0`),
    check("orders_total_consistency_chk", sql`${table.totalAmount} = (${table.subtotalAmount} + ${table.taxAmount} - ${table.discountAmount})`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
    quantity: integer("quantity").notNull(),
    unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 12, scale: 2 }).notNull(),
    taxPercentageSnapshot: numeric("tax_percentage_snapshot", { precision: 5, scale: 2 }).default("0").notNull(),
    lineSubtotal: numeric("line_subtotal", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    index("order_items_product_idx").on(table.productId),
    check("order_items_quantity_positive_chk", sql`${table.quantity} > 0`),
    check("order_items_unit_price_non_negative_chk", sql`${table.unitPriceSnapshot} >= 0`),
    check("order_items_subtotal_non_negative_chk", sql`${table.lineSubtotal} >= 0`),
  ],
);

// Keep provider and method separate for analytics and reconciliation.
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    method: paymentMethodEnum("method").notNull(),
    transactionId: varchar("transaction_id", { length: 150 }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("payments_transaction_id_unique_idx").on(table.transactionId),
    index("payments_order_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),
    index("payments_provider_idx").on(table.provider),
    index("payments_paid_at_idx").on(table.paidAt),
    check("payments_amount_positive_chk", sql`${table.amount} > 0`),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 80 }).notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict", onUpdate: "cascade" }),
    pdfUrl: text("pdf_url"),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("invoices_invoice_number_unique_idx").on(table.invoiceNumber),
    uniqueIndex("invoices_order_unique_idx").on(table.orderId),
    index("invoices_generated_at_idx").on(table.generatedAt),
  ],
);

export const salesLogs = pgTable(
  "sales_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: orderSourceEnum("source").notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("sales_logs_source_idx").on(table.source),
    index("sales_logs_order_idx").on(table.orderId),
    index("sales_logs_created_at_idx").on(table.createdAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityName: varchar("entity_name", { length: 120 }).notNull(),
    entityId: uuid("entity_id"),
    action: auditActionEnum("action").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityName, table.entityId),
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);
