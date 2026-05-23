"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { posProductsRepository } from "../repositories/pos-products.repository";
import type { PosProduct } from "../types/pos.types";
import type { ActionError } from "@/types/action-result";

export async function lookupPosProductByBarcodeAction(
  barcode: string,
): Promise<
  | { success: true; message: string; data: { product: PosProduct } }
  | { success: false; message: string; data: null; errors?: ActionError[] }
> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) {
    return { success: false, message: auth.message, data: null, errors: auth.errors };
  }

  const product = await posProductsRepository.findByBarcode(barcode);
  if (!product) {
    return {
      success: false,
      message: "Product not found.",
      data: null,
      errors: [{ field: "barcode", message: "No matching product." }],
    };
  }

  return {
    success: true,
    message: "Product found.",
    data: { product },
  };
}
