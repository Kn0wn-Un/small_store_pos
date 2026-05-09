import { relations } from "drizzle-orm";
import { coupons, invoices, orderItems, orders, payments, salesLogs } from "../schema/commerce";
import { products } from "../schema/catalog";
import { users } from "../schema/users";

export const ordersRelations = relations(orders, ({ one, many }) => ({
  profile: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  orderItems: many(orderItems),
  payments: many(payments),
  // One invoice per order.
  invoice: one(invoices, {
    fields: [orders.id],
    references: [invoices.orderId],
  }),
  salesLogs: many(salesLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdByProfile: one(users, {
    fields: [coupons.createdBy],
    references: [users.id],
  }),
  // Optional future linkage already supported through orders.couponId.
  orders: many(orders),
}));
