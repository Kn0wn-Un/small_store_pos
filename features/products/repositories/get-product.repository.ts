import { createClient } from "@/supabase/server";
import { mapProductItem } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

const productSelect = `
  id,
  name,
  description,
  image_url,
  category_id,
  sale_price,
  is_active,
  created_at,
  updated_at,
  categories (
    name
  )
`;

export class GetProductRepository {
  async getById(productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("id", productId)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(error);
    if (!data) {
      return null;
    }

    const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;

    return mapProductItem(data, category ?? null);
  }

  async findByNormalizedName(name: string, options?: { excludeProductId?: string }) {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("id, name")
      .is("deleted_at", null)
      .ilike("name", name);

    if (options?.excludeProductId) {
      query = query.neq("id", options.excludeProductId);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    throwOnSupabaseError(error);

    return data ?? null;
  }

  async categoryExists(categoryId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(error);
    return Boolean(data);
  }
}
