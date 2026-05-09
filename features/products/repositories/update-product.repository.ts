import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

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
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .returning();

    return updated ?? null;
  }
}
