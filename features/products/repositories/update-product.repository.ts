import { createClient } from "@/supabase/server";
import type { Database } from "@/types/supabase";
import { mapProductItem, toMoneyNumber } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export class UpdateProductRepository {
  async updateProductById(
    productId: string,
    updates: Partial<{
      name: string;
      description: string | null;
      imageUrl: string | null;
      categoryId: string;
      salePrice: string;
      isActive: boolean;
    }>,
  ) {
    const supabase = await createClient();
    const patch: ProductUpdate = {};

    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.imageUrl !== undefined) patch.image_url = updates.imageUrl;
    if (updates.categoryId !== undefined) patch.category_id = updates.categoryId;
    if (updates.salePrice !== undefined) patch.sale_price = toMoneyNumber(updates.salePrice);
    if (updates.isActive !== undefined) patch.is_active = updates.isActive;

    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", productId)
      .is("deleted_at", null)
      .select(
        `
        id,
        name,
        description,
        image_url,
        category_id,
        sale_price,
        is_active,
        created_at,
        updated_at,
        categories ( name )
      `,
      )
      .maybeSingle();

    throwOnSupabaseError(error);
    if (!data) {
      return null;
    }

    const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
    return mapProductItem(data, category ?? null);
  }
}
