import { db } from "@/db";
import { inventory, inventoryLogs, products } from "@/db/schema";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class CreateProductRepository {
  async createProductTx(
    tx: Transaction,
    payload: {
      categoryId: string;
      name: string;
      description: string | null;
      imageUrl: string | null;
      salePrice: string;
      isActive: boolean;
    },
  ) {
    const [created] = await tx
      .insert(products)
      .values({
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        imageUrl: payload.imageUrl,
        salePrice: payload.salePrice,
        isActive: payload.isActive,
      })
      .returning();

    return created;
  }

  async createInventoryRowTx(tx: Transaction, payload: { productId: string; actorUserId: string }) {
    const [created] = await tx
      .insert(inventory)
      .values({
        productId: payload.productId,
        stockQuantity: 0,
        reservedStock: 0,
        updatedBy: payload.actorUserId,
      })
      .returning();

    return created;
  }

  async createInventoryInitializationLogTx(tx: Transaction, payload: { productId: string; actorUserId: string }) {
    const [created] = await tx
      .insert(inventoryLogs)
      .values({
        productId: payload.productId,
        source: "manual_adjustment",
        reason: "adjustment",
        quantityBefore: 0,
        quantityChange: 0,
        quantityAfter: 0,
        notes: "Inventory initialized on product creation.",
        actorUserId: payload.actorUserId,
      })
      .returning();

    return created;
  }

  async withTransaction<T>(callback: (tx: Transaction) => Promise<T>) {
    return db.transaction(callback);
  }
}
