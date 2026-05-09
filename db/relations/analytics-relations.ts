import { relations } from "drizzle-orm";
import { orders, salesLogs } from "../schema/commerce";

export const salesLogsRelations = relations(salesLogs, ({ one }) => ({
  order: one(orders, {
    fields: [salesLogs.orderId],
    references: [orders.id],
  }),
}));
