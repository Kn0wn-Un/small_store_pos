import { createClient } from "@/supabase/server";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class DeleteProductRepository {
  async softDeleteById(productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ?? null;
  }
}
