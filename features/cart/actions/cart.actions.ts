"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { cartService } from "../services/cart.service";

export async function createCartAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  return cartService.createCart(payload);
}

export async function addToCartAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  const result = await cartService.addToCart(payload);
  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/pos");
  }
  return result;
}

export async function updateCartItemAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  const result = await cartService.updateItemQuantity(payload);
  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/pos");
  }
  return result;
}

export async function removeCartItemAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  const result = await cartService.removeItem(payload);
  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/pos");
  }
  return result;
}

export async function clearCartAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  const result = await cartService.clear(payload);
  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/pos");
  }
  return result;
}

export async function getCartAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;
  return cartService.getCart(payload);
}
