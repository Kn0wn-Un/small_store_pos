import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { ProductFiltersInput } from "../schemas/product-filters.schema";

export class ListProductsRepository {
  async list(filters: ProductFiltersInput) {
    const conditions = [isNull(products.deletedAt)];

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(or(ilike(products.name, searchPattern), ilike(categories.name, searchPattern)));
    }

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters.storefrontOnly) {
      conditions.push(eq(products.isActive, true));
    } else if (typeof filters.isActive === "boolean") {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    const whereClause = and(...conditions);
    const offset = (filters.page - 1) * filters.pageSize;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause);

    const rows = await db
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
      .where(whereClause)
      .orderBy(desc(products.updatedAt))
      .limit(filters.pageSize)
      .offset(offset);

    return {
      rows,
      total: countResult?.count ?? 0,
    };
  }
}
