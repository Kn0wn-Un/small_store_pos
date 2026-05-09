import { relations } from "drizzle-orm";
import { cartItems, carts } from "../schema/commerce";
import { products } from "../schema/catalog";
import { users } from "../schema/users";

export const cartsRelations = relations(carts, ({ one, many }) => ({
  profile: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));
