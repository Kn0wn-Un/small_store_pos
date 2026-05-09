import { relations } from "drizzle-orm";
import { addresses, auditLogs, carts, coupons, inventory, inventoryLogs, orders, sessions, users } from "../schema";

// Domain note: "profiles" in product language maps to the `users` table in schema.
export const profilesRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  sessions: many(sessions),
  carts: many(carts),
  orders: many(orders),
  inventoryUpdates: many(inventory),
  inventoryLogs: many(inventoryLogs),
  couponsCreated: many(coupons),
  auditLogs: many(auditLogs),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  profile: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  profile: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));
