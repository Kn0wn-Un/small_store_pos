import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export class DeleteProductRepository {
  async softDeleteById(productId: string) {
    const [deleted] = await db
      .update(products)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .returning({
        id: products.id,
      });

    return deleted ?? null;
  }
}
