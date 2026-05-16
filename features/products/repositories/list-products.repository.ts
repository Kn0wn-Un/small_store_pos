import { createClient } from "@/supabase/server";
import { mapProductItem } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import type { ProductFiltersInput } from "../schemas/product-filters.schema";

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

export class ListProductsRepository {
  async list(filters: ProductFiltersInput) {
    const supabase = await createClient();
    const offset = (filters.page - 1) * filters.pageSize;

    let query = supabase
      .from("products")
      .select(productSelect, { count: "exact" })
      .is("deleted_at", null);

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(`name.ilike."${searchPattern}",categories.name.ilike."${searchPattern}"`);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.storefrontOnly) {
      query = query.eq("is_active", true);
    } else if (typeof filters.isActive === "boolean") {
      query = query.eq("is_active", filters.isActive);
    }

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + filters.pageSize - 1);

    throwOnSupabaseError(error);

    const rows = (data ?? []).map((row) => {
      const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      return mapProductItem(row, category ?? null);
    });

    return {
      rows,
      total: count ?? 0,
    };
  }
}
