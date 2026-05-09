"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/supabase/server";
import type { ProductMutationActor, ProductResponse } from "../types/product.types";
import { deleteProductService } from "../services/delete-product.service";

async function authorizeProductMutation(): Promise<ProductResponse<ProductMutationActor>> {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData.user) {
    return { success: false, message: "Unauthorized.", data: null, errors: [{ field: "auth", message: "Sign in required." }] };
  }

  const [profile] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(and(eq(users.id, authData.user.id), eq(users.isActive, true)))
    .limit(1);

  if (!profile || (profile.role !== "admin" && profile.role !== "cashier")) {
    return { success: false, message: "Forbidden.", data: null, errors: [{ field: "auth", message: "Insufficient role." }] };
  }

  return {
    success: true,
    message: "Authorized.",
    data: { userId: profile.id, role: profile.role },
  };
}

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
