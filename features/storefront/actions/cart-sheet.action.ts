"use server";

import { cookies } from "next/headers";
import { clearCartAction, removeCartItemAction, updateCartItemAction } from "@/features/cart/actions/cart.actions";
import { getStorefrontCartAction } from "./add-to-cart.action";

const CART_COOKIE_KEY = "storefront_cart_id";

export async function updateStorefrontCartItemAction(payload: { cartItemId: string; quantity: number }) {
  return updateCartItemAction(payload);
}

export async function removeStorefrontCartItemAction(payload: { cartItemId: string }) {
  return removeCartItemAction(payload);
}

export async function clearStorefrontCartAction() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
  if (!cartId) {
    return {
      success: true,
      message: "Cart already empty.",
      data: null,
    };
  }
  return clearCartAction({ cartId });
}

export async function getStorefrontCartForSheetAction() {
  return getStorefrontCartAction();
}
