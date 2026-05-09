import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "./catalog";
import { inventoryReasonEnum, inventorySourceEnum } from "./enums";
import { users } from "./users";

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    reservedStock: integer("reserved_stock").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("inventory_product_id_idx").on(table.productId),
    index("inventory_low_stock_idx").on(table.stockQuantity, table.lowStockThreshold),
    check("inventory_stock_non_negative_chk", sql`${table.stockQuantity} >= 0`),
    check("inventory_reserved_non_negative_chk", sql`${table.reservedStock} >= 0`),
    check("inventory_reserved_lte_stock_chk", sql`${table.reservedStock} <= ${table.stockQuantity}`),
    check("inventory_threshold_non_negative_chk", sql`${table.lowStockThreshold} >= 0`),
  ],
);

export const inventoryLogs = pgTable(
  "inventory_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
    source: inventorySourceEnum("source").notNull(),
    reason: inventoryReasonEnum("reason").notNull(),
    quantityBefore: integer("quantity_before").notNull(),
    quantityChange: integer("quantity_change").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    referenceOrderId: uuid("reference_order_id"),
    referenceInvoiceId: uuid("reference_invoice_id"),
    notes: text("notes"),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("inventory_logs_product_idx").on(table.productId),
    index("inventory_logs_source_idx").on(table.source),
    index("inventory_logs_actor_idx").on(table.actorUserId),
    index("inventory_logs_created_at_idx").on(table.createdAt),
    check("inventory_logs_before_non_negative_chk", sql`${table.quantityBefore} >= 0`),
    check("inventory_logs_after_non_negative_chk", sql`${table.quantityAfter} >= 0`),
    check("inventory_logs_balance_math_chk", sql`${table.quantityBefore} + ${table.quantityChange} = ${table.quantityAfter}`),
  ],
);
