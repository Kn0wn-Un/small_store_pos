import { createClient } from "@/supabase/server";
import { mapStorefrontProduct } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

const storefrontSelect = `
  id,
  name,
  description,
  image_url,
  category_id,
  sale_price,
  is_active,
  categories ( name ),
  inventory (
    stock_quantity,
    low_stock_threshold
  )
`;

export class StorefrontProductsRepository {
  async getFeaturedProducts(limit = 6) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(storefrontSelect)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    throwOnSupabaseError(error);

    return (data ?? []).map((row) => {
      const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const inventoryRow = Array.isArray(row.inventory) ? row.inventory[0] : row.inventory;
      return mapStorefrontProduct(row, inventoryRow ?? null, category ?? null);
    });
  }

  async getProductById(productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(storefrontSelect)
      .eq("id", productId)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(error);
    if (!data) {
      return null;
    }

    const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
    const inventoryRow = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
    return mapStorefrontProduct(data, inventoryRow ?? null, category ?? null);
  }
}

export const storefrontProductsRepository = new StorefrontProductsRepository();
