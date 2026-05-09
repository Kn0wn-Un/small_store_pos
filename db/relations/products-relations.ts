import { relations } from "drizzle-orm";
import { cartItems, categories, orderItems, products } from "../schema";
import { inventory, inventoryLogs } from "../schema/inventory";

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  // One-to-one source-of-truth inventory row per product.
  inventory: one(inventory, {
    fields: [products.id],
    references: [inventory.productId],
  }),
  inventoryLogs: many(inventoryLogs),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));
