import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema/catalog";
import { inventory } from "@/db/schema/inventory";

export class StorefrontProductsRepository {
  async getFeaturedProducts(limit = 6) {
    return db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        categoryName: sql<string | null>`null`,
        salePrice: products.salePrice,
        isActive: products.isActive,
        stockQuantity: inventory.stockQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
      })
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(and(eq(products.isActive, true), isNull(products.deletedAt)))
      .orderBy(desc(products.updatedAt))
      .limit(limit);
  }

  async getProductById(productId: string) {
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        categoryName: sql<string | null>`null`,
        salePrice: products.salePrice,
        isActive: products.isActive,
        stockQuantity: inventory.stockQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
      })
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    return row ?? null;
  }
}

export const storefrontProductsRepository = new StorefrontProductsRepository();
