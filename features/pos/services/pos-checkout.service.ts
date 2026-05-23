import type { ActionResult } from "@/types/action-result";
import { checkoutService } from "@/features/checkout/services/checkout.service";
import { posCheckoutSchema } from "../schemas/pos-checkout.schema";
import type { PosCheckoutResult } from "../types/pos.types";
import { getPosCartIdFromCookie } from "../utils/pos-cart-cookie";

export class PosCheckoutService {
  async execute(payload: unknown): Promise<ActionResult<PosCheckoutResult>> {
    const parsed = posCheckoutSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid checkout payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid checkout data." }],
      };
    }

    const cartId = await getPosCartIdFromCookie();
    if (!cartId) {
      return {
        success: false,
        message: "Cart is empty.",
        data: null,
        errors: [{ field: "cart", message: "No active POS cart." }],
      };
    }

    const result = await checkoutService.execute({
      cartId,
      customerId: parsed.data.customerId,
      source: "pos",
      paymentProvider: parsed.data.paymentProvider,
      paymentMethod: parsed.data.paymentMethod,
      transactionId: parsed.data.transactionId,
      discountAmount: parsed.data.discountAmount,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
        data: null,
        errors: result.errors,
      };
    }

    const data = result.data as Record<string, unknown>;
    return {
      success: true,
      message: result.message,
      data: {
        orderId: typeof data.orderId === "string" ? data.orderId : undefined,
        paymentId: typeof data.paymentId === "string" ? data.paymentId : undefined,
        invoiceId: typeof data.invoiceId === "string" ? data.invoiceId : undefined,
      },
    };
  }
}

export const posCheckoutService = new PosCheckoutService();
