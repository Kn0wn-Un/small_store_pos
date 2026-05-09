import { addMoney, toMoney } from "@/utils/money";
import { calculateTaxAmount } from "@/utils/tax";
import type { CartItemView, CartTotals } from "../types/cart.types";

export class CalculateCartTotalsService {
  execute(items: CartItemView[], discountAmount = "0.00"): CartTotals {
    const subtotal = addMoney(...items.map((item) => Number(item.unitPrice) * item.quantity));
    const taxAmount = addMoney(...items.map((item) => calculateTaxAmount(Number(item.unitPrice) * item.quantity, item.taxPercentage)));
    const total = toMoney(Number(subtotal) + Number(taxAmount) - Number(discountAmount));

    return {
      subtotal,
      taxAmount,
      discountAmount: toMoney(discountAmount),
      total,
    };
  }
}

export const calculateCartTotalsService = new CalculateCartTotalsService();
