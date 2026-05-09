"use server";

import { checkoutAction } from "@/features/checkout/actions/checkout.action";
import type { ActionResult } from "@/types/action-result";
import { getStorefrontCartAction } from "./add-to-cart.action";

type CheckoutSessionPayload = {
  customerId: string;
  addressId?: string;
  paymentMethod: "cash" | "upi" | "card" | "bank_transfer";
};

type CheckoutSessionData = {
  orderId: string | null;
  paymentPayload: {
    amount: string;
    currency: string;
    method: "cash" | "upi" | "card" | "bank_transfer";
  };
  verificationMetadata: {
    cartId: string;
  };
};

function hasOrderId(data: unknown): data is { orderId: string } {
  return Boolean(data && typeof data === "object" && "orderId" in data);
}

export async function createCheckoutSessionAction(payload: CheckoutSessionPayload): Promise<ActionResult<CheckoutSessionData>> {
  const cartResult = await getStorefrontCartAction();
  if (!cartResult.success || !cartResult.data || !cartResult.data.cartId) {
    return {
      success: false,
      message: "Cart not available.",
      data: null,
      errors: [{ field: "cart", message: "Please add products before checkout." }],
    };
  }

  const provider = payload.paymentMethod === "upi" ? "upi" : payload.paymentMethod === "card" ? "card" : "cash";

  const orderResult = await checkoutAction({
    cartId: cartResult.data.cartId,
    customerId: payload.customerId,
    source: "ecommerce",
    addressId: payload.addressId,
    paymentProvider: provider,
    paymentMethod: payload.paymentMethod,
    transactionId: payload.paymentMethod === "cash" ? undefined : `txn_${Date.now()}`,
    discountAmount: cartResult.data.totals.discountAmount,
  });

  if (!orderResult.success) {
    return {
      success: false,
      message: orderResult.message,
      data: null,
      errors: orderResult.errors,
    };
  }

  return {
    success: true,
    message: "Checkout session created.",
    data: {
      orderId: hasOrderId(orderResult.data) ? orderResult.data.orderId : null,
      paymentPayload: {
        amount: cartResult.data.totals.total,
        currency: "INR",
        method: payload.paymentMethod,
      },
      verificationMetadata: {
        cartId: cartResult.data.cartId,
      },
    },
  };
}
