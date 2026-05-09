import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "cashier", "customer"]);

export const orderSourceEnum = pgEnum("order_source", ["pos", "ecommerce"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "cash",
  "upi",
  "card",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "card",
  "bank_transfer",
]);

export const inventorySourceEnum = pgEnum("inventory_source", [
  "pos_sale",
  "ecommerce_order",
  "manual_adjustment",
  "refund",
]);

export const inventoryReasonEnum = pgEnum("inventory_reason", [
  "sale",
  "restock",
  "adjustment",
  "refund",
  "damage",
  "return",
  "correction",
]);

export const cartStatusEnum = pgEnum("cart_status", ["active", "converted", "abandoned"]);

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed_amount"]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "status_change",
  "login",
  "logout",
  "payment",
  "refund",
]);
