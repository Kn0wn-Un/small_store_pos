import type { CartTotals, CartItemView } from "@/features/cart/types/cart.types";
import type { StorefrontProduct } from "@/types/storefront/product";

export type PosProduct = StorefrontProduct & {
  sku: string;
};

export type PosCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PosPaymentProvider = "cash" | "upi" | "card";
export type PosPaymentMethod = "cash" | "upi" | "card" | "bank_transfer";

export type PosCartData = {
  cartId: string;
  items: CartItemView[];
  totals: CartTotals;
};

export type PosCheckoutResult = {
  orderId?: string;
  paymentId?: string;
  invoiceId?: string;
};

export type PosProductFilters = {
  search?: string;
  categoryId?: string | null;
  page?: number;
  pageSize?: number;
};

export type PosCatalogData = {
  products: PosProduct[];
  total: number;
  categories: PosCategory[];
};
