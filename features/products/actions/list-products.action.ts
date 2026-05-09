"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/supabase/server";
import { productFiltersSchema } from "../schemas/product-filters.schema";
import type { ProductMutationActor, ProductResponse } from "../types/product.types";
import { listProductsService } from "../services/list-products.service";

async function authorizeDashboardRead(): Promise<ProductResponse<ProductMutationActor>> {
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
    const auth = await authorizeDashboardRead();
    if (!auth.success) {
      return auth;
    }
  }

  return listProductsService.execute(parsed.data);
}
