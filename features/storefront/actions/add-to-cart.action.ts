"use server";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types/action-result";
import { addToCartAction, createCartAction, getCartAction } from "@/features/cart/actions/cart.actions";

type AddToCartPayload = {
  productId: string;
  quantity: number;
  unitPrice: string;
  taxPercentage?: string;
};

const CART_COOKIE_KEY = "storefront_cart_id";
export type StorefrontCartData = {
  cartId: string;
  items: Array<{
    cartItemId: string;
    productId: string;
    productName: string | null;
    quantity: number;
    unitPrice: string;
    taxPercentage: string;
    lineSubtotal: string;
  }>;
  totals: {
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    total: string;
  };
};

function hasCartId(data: unknown): data is { cartId: string } {
  return Boolean(data && typeof data === "object" && "cartId" in data && typeof (data as { cartId?: unknown }).cartId === "string");
}

function isStorefrontCartData(data: unknown): data is StorefrontCartData {
  return Boolean(data && typeof data === "object" && "items" in data && "totals" in data);
}

async function getOrCreateCartId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE_KEY)?.value;
  if (existing) return existing;

  const created = await createCartAction({
    source: "ecommerce",
  });

  if (!created.success || !hasCartId(created.data)) {
    return null;
  }

  cookieStore.set(CART_COOKIE_KEY, created.data.cartId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return created.data.cartId;
}

export async function addProductToStorefrontCartAction(payload: AddToCartPayload): Promise<ActionResult<{ cartId: string }>> {
  const cartId = await getOrCreateCartId();
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
    taxPercentage: payload.taxPercentage ?? "0",
    source: "ecommerce",
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      data: null,
      errors: result.errors,
    };
  }

  return {
    success: true,
    message: "Item added to cart.",
    data: { cartId },
  };
}

export async function getStorefrontCartAction(): Promise<ActionResult<StorefrontCartData>> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
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
  if (!result.success || !isStorefrontCartData(result.data)) {
    return {
      success: false,
      message: result.message,
      data: {
        cartId,
        items: [],
        totals: { subtotal: "0.00", taxAmount: "0.00", discountAmount: "0.00", total: "0.00" },
      } satisfies StorefrontCartData,
      errors: result.errors,
    };
  }

  return {
    success: true,
    message: result.message,
    data: result.data,
  };
}
