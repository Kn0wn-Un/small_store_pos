import { relations } from "drizzle-orm";
import { invoices, orders } from "../schema/commerce";

export const invoicesRelations = relations(invoices, ({ one }) => ({
  // One-to-one with orders via unique invoices.orderId.
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
}));
