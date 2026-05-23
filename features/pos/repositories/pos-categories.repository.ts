import { createClient } from "@/supabase/server";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import type { PosCategory } from "../types/pos.types";

export class PosCategoriesRepository {
  async listActive(): Promise<PosCategory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    throwOnSupabaseError(error);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));
  }
}

export const posCategoriesRepository = new PosCategoriesRepository();
