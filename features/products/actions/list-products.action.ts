"use server";

import { authorizeProductMutation } from "@/lib/auth/authorize-product-mutation";
import { productFiltersSchema } from "../schemas/product-filters.schema";
import { listProductsService } from "../services/list-products.service";

export async function listProductsAction(payload: unknown) {
  const parsed = productFiltersSchema.safeParse(payload ?? {});
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid product filters.",
      data: null,
      errors: [{ field: "filters", message: "Invalid filters payload." }],
    };
  }

  if (!parsed.data.storefrontOnly) {
    const auth = await authorizeProductMutation();
    if (!auth.success) {
      return auth;
    }
  }

  return listProductsService.execute(parsed.data);
}
