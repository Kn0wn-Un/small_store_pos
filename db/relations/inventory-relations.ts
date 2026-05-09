import { relations } from "drizzle-orm";
import { inventory, inventoryLogs } from "../schema/inventory";
import { products } from "../schema/catalog";
import { users } from "../schema/users";

export const inventoryRelations = relations(inventory, ({ one }) => ({
  // Inverse of product -> inventory one-to-one relation.
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  updatedByProfile: one(users, {
    fields: [inventory.updatedBy],
    references: [users.id],
  }),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLogs.productId],
    references: [products.id],
  }),
  profile: one(users, {
    fields: [inventoryLogs.actorUserId],
    references: [users.id],
  }),
}));
