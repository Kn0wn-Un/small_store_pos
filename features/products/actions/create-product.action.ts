"use server";

import { revalidatePath } from "next/cache";
import { authorizeProductMutation } from "@/lib/auth/authorize-product-mutation";
import { createProductService } from "../services/create-product.service";

export async function createProductAction(payload: unknown) {
  const auth = await authorizeProductMutation();
  if (!auth.success || !auth.data) {
    return auth;
  }

  const result = await createProductService.execute(payload, auth.data);
  if (result.success) {
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/pos");
  }

  return result;
}
