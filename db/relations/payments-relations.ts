import { relations } from "drizzle-orm";
import { orders, payments } from "../schema/commerce";

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));
