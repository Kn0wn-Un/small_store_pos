"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { addToCartAction, clearCartAction, getCartAction } from "@/features/cart/actions/cart.actions";
import { cartRepository } from "@/features/cart/repositories/cart.repository";
import { cartService } from "@/features/cart/services/cart.service";
import type { CartView } from "@/features/cart/types/cart.types";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import type { ActionResult } from "@/types/action-result";
import { POS_DEFAULT_TAX_PERCENTAGE } from "../constants/pos.constants";
import { clearPosCartIdCookie, getPosCartIdFromCookie, setPosCartIdCookie } from "../utils/pos-cart-cookie";
import type { PosCartData } from "../types/pos.types";

function isCartView(data: unknown): data is CartView {
  return Boolean(data && typeof data === "object" && "cartId" in data && "items" in data && "totals" in data);
}

function authFailure<T>(auth: ActionResult<{ userId: string; role: string }>): ActionResult<T> {
  return { success: false, message: auth.message, data: null, errors: auth.errors };
}

async function getOrCreatePosCartId(userId?: string): Promise<string | null> {
  const existing = await getPosCartIdFromCookie();
  if (existing) return existing;

  const created = await cartRepository.createCart({
    source: "pos",
    userId,
  });

  await setPosCartIdCookie(created.id);
  return created.id;
}

export async function getPosCartAction(): Promise<ActionResult<PosCartData>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return authFailure(auth);

  const cartId = await getPosCartIdFromCookie();
  if (!cartId) {
    return {
      success: true,
      message: "Cart is empty.",
      data: {
        cartId: "",
        items: [],
        totals: { subtotal: "0.00", taxAmount: "0.00", discountAmount: "0.00", total: "0.00" },
      },
    };
  }

  const result = await getCartAction({ cartId });
  if (!result.success || !isCartView(result.data)) {
    return {
      success: false,
      message: result.message,
      data: {
        cartId,
        items: [],
        totals: { subtotal: "0.00", taxAmount: "0.00", discountAmount: "0.00", total: "0.00" },
      },
      errors: result.errors,
    };
  }

  return { success: true, message: result.message, data: result.data };
}

type AddPosItemPayload = {
  productId: string;
  quantity: number;
  unitPrice: string;
  taxPercentage?: string;
};

export async function addPosCartItemAction(payload: AddPosItemPayload): Promise<ActionResult<{ cartId: string }>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return authFailure(auth);

  const cartId = await getOrCreatePosCartId(auth.data!.userId);
  if (!cartId) {
    return {
      success: false,
      message: "Unable to initialize cart.",
      data: null,
      errors: [{ field: "cart", message: "Cart initialization failed." }],
    };
  }

  const result = await addToCartAction({
    cartId,
    productId: payload.productId,
    quantity: payload.quantity,
    unitPrice: payload.unitPrice,
    taxPercentage: payload.taxPercentage ?? POS_DEFAULT_TAX_PERCENTAGE,
    source: "pos",
  });

  if (result.success) {
    revalidatePath("/admin/pos");
    revalidatePath("/cashier/pos");
    revalidatePath("/pos");
  }

  return result.success
    ? { success: true, message: result.message, data: { cartId } }
    : { success: false, message: result.message, data: null, errors: result.errors };
}

export async function updatePosCartItemAction(payload: {
  cartItemId: string;
  quantity: number;
}): Promise<ActionResult<{ cartItemId: string }>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return authFailure(auth);

  const result = await cartService.updateItemQuantity(payload);
  if (result.success) {
    revalidatePath("/admin/pos");
    revalidatePath("/cashier/pos");
    revalidatePath("/pos");
  }
  return result;
}

export async function removePosCartItemAction(payload: {
  cartItemId: string;
}): Promise<ActionResult<{ cartItemId: string }>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return authFailure(auth);

  const result = await cartService.removeItem(payload);
  if (result.success) {
    revalidatePath("/admin/pos");
    revalidatePath("/cashier/pos");
    revalidatePath("/pos");
  }
  return result;
}

export async function clearPosCartAction(): Promise<ActionResult<{ cartId: string }>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return authFailure(auth);

  const cartId = await getPosCartIdFromCookie();
  if (!cartId) {
    return { success: true, message: "Cart already empty.", data: { cartId: "" } };
  }

  const result = await clearCartAction({ cartId });
  await clearPosCartIdCookie();

  if (result.success) {
    revalidatePath("/admin/pos");
    revalidatePath("/cashier/pos");
    revalidatePath("/pos");
  }

  return result.success
    ? { success: true, message: result.message, data: { cartId } }
    : { success: false, message: result.message, data: null, errors: result.errors };
}
