import { createClient } from "@/supabase/server";
import type { ProductMutationActor, ProductResponse } from "@/features/products/types/product.types";
import { getActiveUserProfile } from "./get-user-profile";

export async function authorizeProductMutation(): Promise<ProductResponse<ProductMutationActor>> {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData.user) {
    return { success: false, message: "Unauthorized.", data: null, errors: [{ field: "auth", message: "Sign in required." }] };
  }

  const profile = await getActiveUserProfile(authData.user.id);

  if (!profile || (profile.role !== "admin" && profile.role !== "cashier")) {
    return { success: false, message: "Forbidden.", data: null, errors: [{ field: "auth", message: "Insufficient role." }] };
  }

  return {
    success: true,
    message: "Authorized.",
    data: { userId: profile.id, role: profile.role as "admin" | "cashier" },
  };
}
