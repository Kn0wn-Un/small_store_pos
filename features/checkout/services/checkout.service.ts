import type { ActionResult } from "@/types/action-result";
import { addMoney } from "@/utils/money";
import { cartService } from "@/features/cart/services/cart.service";
import { ordersService } from "@/features/orders/services/orders.service";
import { checkoutSchema } from "../schemas/checkout.schema";
import { checkoutRepository } from "../repositories/checkout.repository";

export class CheckoutService {
  async execute(payload: unknown): Promise<ActionResult<Record<string, unknown>>> {
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid checkout payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload." }],
      };
    }

    if (parsed.data.addressId) {
      const validAddress = await checkoutRepository.validateAddressForUser({
        addressId: parsed.data.addressId,
        userId: parsed.data.customerId,
      });
      if (!validAddress) {
        return {
          success: false,
          message: "Invalid delivery address.",
          data: null,
          errors: [{ field: "addressId", message: "Address does not belong to user." }],
        };
      }
    }

    const cartResult = await cartService.getCart({ cartId: parsed.data.cartId });
    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        message: "Cart not available for checkout.",
        data: null,
        errors: cartResult.errors,
      };
    }

    const orderPayload = {
      customerId: parsed.data.customerId,
      source: parsed.data.source,
      paymentProvider: parsed.data.paymentProvider,
      paymentMethod: parsed.data.paymentMethod,
      transactionId: parsed.data.transactionId,
      paymentStatus: "paid" as const,
      subtotalAmount: cartResult.data.totals.subtotal,
      taxAmount: cartResult.data.totals.taxAmount,
      discountAmount: parsed.data.discountAmount,
      totalAmount: addMoney(
        cartResult.data.totals.subtotal,
        cartResult.data.totals.taxAmount,
        -Number(parsed.data.discountAmount),
      ),
      items: cartResult.data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPrice,
        taxPercentageSnapshot: item.taxPercentage,
        lineSubtotal: item.lineSubtotal,
      })),
    };

    const orderResult = await ordersService.createOrder(orderPayload);
    if (!orderResult.success) {
      return orderResult;
    }

    await cartService.clear({ cartId: parsed.data.cartId });

    return {
      success: true,
      message: "Checkout completed successfully.",
      data: orderResult.data,
    };
  }
}

export const checkoutService = new CheckoutService();
