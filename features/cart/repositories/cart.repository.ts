import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";

export class CartRepository {
  async createCart(payload: { userId?: string; source: "pos" | "ecommerce" }) {
    const [created] = await db
      .insert(carts)
      .values({
        userId: payload.userId,
        source: payload.source,
      })
      .returning();
    return created;
  }

  async getCartById(cartId: string) {
    const [row] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
    return row ?? null;
  }

  async getCartItems(cartId: string) {
    return db
      .select({
        cartItemId: cartItems.id,
        productId: cartItems.productId,
        productName: products.name,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        taxPercentage: cartItems.taxPercentage,
      })
      .from(cartItems)
      .leftJoin(products, eq(products.id, cartItems.productId))
      .where(eq(cartItems.cartId, cartId));
  }

  async getCartItemByProduct(cartId: string, productId: string) {
    const [row] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
      .limit(1);
    return row ?? null;
  }

  async addCartItem(payload: {
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    taxPercentage: string;
  }) {
    const [created] = await db
      .insert(cartItems)
      .values({
        cartId: payload.cartId,
        productId: payload.productId,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
        taxPercentage: payload.taxPercentage,
      })
      .returning();
    return created;
  }

  async updateCartItemQuantity(payload: { cartItemId: string; quantity: number }) {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: payload.quantity })
      .where(eq(cartItems.id, payload.cartItemId))
      .returning();
    return updated ?? null;
  }

  async deleteCartItem(cartItemId: string) {
    const [deleted] = await db.delete(cartItems).where(eq(cartItems.id, cartItemId)).returning();
    return deleted ?? null;
  }

  async clearCart(cartId: string) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}

export const cartRepository = new CartRepository();
