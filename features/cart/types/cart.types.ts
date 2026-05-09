import type { ActionResult } from "@/types/action-result";

export type CartTotals = {
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
};

export type CartItemView = {
  cartItemId: string;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: string;
  taxPercentage: string;
  lineSubtotal: string;
};

export type CartView = {
  cartId: string;
  items: CartItemView[];
  totals: CartTotals;
};

export type CartResult<TData = null> = ActionResult<TData>;
