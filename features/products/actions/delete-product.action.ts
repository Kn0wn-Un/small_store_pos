"use server";

import { revalidatePath } from "next/cache";
import { authorizeProductMutation } from "@/lib/auth/authorize-product-mutation";
import { deleteProductService } from "../services/delete-product.service";

export async function deleteProductAction(payload: unknown) {
  const auth = await authorizeProductMutation();
  if (!auth.success || !auth.data) {
    return auth;
  }

  const result = await deleteProductService.execute(payload, auth.data);
  if (result.success) {
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/pos");
  }

  return result;
}
