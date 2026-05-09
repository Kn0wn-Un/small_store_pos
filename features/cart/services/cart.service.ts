import { toMoney } from "@/utils/money";
import { z } from "zod";
import { addToCartSchema, clearCartSchema, getCartSchema, removeCartItemSchema, updateCartItemSchema } from "../schemas/cart.schema";
import { cartRepository } from "../repositories/cart.repository";
import type { CartItemView, CartResult, CartView } from "../types/cart.types";
import { calculateCartTotalsService } from "./calculate-cart-totals.service";

export class CartService {
  async createCart(payload: unknown): Promise<CartResult<{ cartId: string }>> {
    const parsed = addToCartSchema.pick({ userId: true, source: true }).safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid create cart payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const created = await cartRepository.createCart({
      userId: parsed.data.userId,
      source: parsed.data.source,
    });

    return { success: true, message: "Cart created.", data: { cartId: created.id } };
  }

  async addToCart(payload: unknown): Promise<CartResult<{ cartItemId: string; cartId: string }>> {
    const parsed = addToCartSchema.extend({ cartId: z.string().uuid() }).safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid add-to-cart payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const existing = await cartRepository.getCartItemByProduct(parsed.data.cartId, parsed.data.productId);
    if (existing) {
      const updated = await cartRepository.updateCartItemQuantity({
        cartItemId: existing.id,
        quantity: existing.quantity + parsed.data.quantity,
      });
      if (!updated) {
        return { success: false, message: "Unable to update cart item.", data: null, errors: [{ field: "cartItem", message: "Update failed." }] };
      }
      return { success: true, message: "Cart item quantity updated.", data: { cartItemId: updated.id, cartId: updated.cartId } };
    }

    const created = await cartRepository.addCartItem({
      cartId: parsed.data.cartId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      unitPrice: toMoney(parsed.data.unitPrice),
      taxPercentage: toMoney(parsed.data.taxPercentage),
    });

    return { success: true, message: "Item added to cart.", data: { cartItemId: created.id, cartId: created.cartId } };
  }

  async updateItemQuantity(payload: unknown): Promise<CartResult<{ cartItemId: string }>> {
    const parsed = updateCartItemSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid update payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const updated = await cartRepository.updateCartItemQuantity(parsed.data);
    if (!updated) {
      return { success: false, message: "Cart item not found.", data: null, errors: [{ field: "cartItemId", message: "No cart item found." }] };
    }

    return { success: true, message: "Cart item updated.", data: { cartItemId: updated.id } };
  }

  async removeItem(payload: unknown): Promise<CartResult<{ cartItemId: string }>> {
    const parsed = removeCartItemSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid remove payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const deleted = await cartRepository.deleteCartItem(parsed.data.cartItemId);
    if (!deleted) {
      return { success: false, message: "Cart item not found.", data: null, errors: [{ field: "cartItemId", message: "No cart item found." }] };
    }

    return { success: true, message: "Cart item removed.", data: { cartItemId: deleted.id } };
  }

  async clear(payload: unknown): Promise<CartResult<{ cartId: string }>> {
    const parsed = clearCartSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid clear cart payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }
    await cartRepository.clearCart(parsed.data.cartId);
    return { success: true, message: "Cart cleared.", data: { cartId: parsed.data.cartId } };
  }

  async getCart(payload: unknown): Promise<CartResult<CartView>> {
    const parsed = getCartSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid get cart payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const cart = await cartRepository.getCartById(parsed.data.cartId);
    if (!cart) {
      return { success: false, message: "Cart not found.", data: null, errors: [{ field: "cartId", message: "Cart does not exist." }] };
    }

    const rows = await cartRepository.getCartItems(parsed.data.cartId);
    const items: CartItemView[] = rows.map((item) => ({
      cartItemId: item.cartItemId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxPercentage: item.taxPercentage,
      lineSubtotal: toMoney(Number(item.unitPrice) * item.quantity),
    }));

    return {
      success: true,
      message: "Cart fetched successfully.",
      data: {
        cartId: cart.id,
        items,
        totals: calculateCartTotalsService.execute(items),
      },
    };
  }
}

export const cartService = new CartService();
