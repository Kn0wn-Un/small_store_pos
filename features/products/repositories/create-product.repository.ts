import { mapInventoryRow } from "@/lib/supabase/mappers";
import { callCreateProductRpc } from "@/lib/supabase/rpc";
import { uniqueSlugFromName } from "@/lib/supabase/slug";

export class CreateProductRepository {
  async createProductWithInventory(payload: {
    categoryId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    salePrice: string;
    isActive: boolean;
    actorUserId: string;
  }) {
    const result = await callCreateProductRpc({
      categoryId: payload.categoryId,
      name: payload.name,
      slug: uniqueSlugFromName(payload.name),
      description: payload.description,
      imageUrl: payload.imageUrl,
      salePrice: payload.salePrice,
      isActive: payload.isActive,
      actorUserId: payload.actorUserId,
    });

    return {
      product: {
        id: result.product.id,
        categoryId: result.product.category_id,
        name: result.product.name,
        description: result.product.description,
        imageUrl: result.product.image_url,
        salePrice: String(result.product.sale_price),
        isActive: result.product.is_active,
        createdAt: new Date(result.product.created_at),
        updatedAt: new Date(result.product.updated_at),
        deletedAt: result.product.deleted_at ? new Date(result.product.deleted_at) : null,
      },
      inventory: mapInventoryRow(result.inventory),
    };
  }
}
