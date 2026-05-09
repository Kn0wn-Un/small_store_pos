import { and, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export class GetProductRepository {
  async getById(productId: string) {
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        categoryName: categories.name,
        salePrice: products.salePrice,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    return row ?? null;
  }

  async findByNormalizedName(name: string, options?: { excludeProductId?: string }) {
    const conditions = [
      sql`lower(${products.name}) = lower(${name})`,
      isNull(products.deletedAt),
    ];

    if (options?.excludeProductId) {
      conditions.push(ne(products.id, options.excludeProductId));
    }

    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
      })
      .from(products)
      .where(and(...conditions))
      .limit(1);

    return row ?? null;
  }

  async categoryExists(categoryId: string) {
    const [row] = await db
      .select({
        id: categories.id,
      })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.isActive, true), isNull(categories.deletedAt)))
      .limit(1);

    return Boolean(row);
  }
}
