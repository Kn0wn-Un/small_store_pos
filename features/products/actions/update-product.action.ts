"use server";

import { revalidatePath } from "next/cache";
import { authorizeProductMutation } from "@/lib/auth/authorize-product-mutation";
import { updateProductService } from "../services/update-product.service";

export async function updateProductAction(payload: unknown) {
  const auth = await authorizeProductMutation();
  if (!auth.success || !auth.data) {
    return auth;
  }

  const result = await updateProductService.execute(payload, auth.data);
  if (result.success) {
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/pos");
  }

  return result;
}
