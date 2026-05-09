import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventory, inventoryLogs } from "@/db/schema";
import type { DbTransaction } from "@/lib/transaction";

export class InventoryRepository {
  async withTransaction<T>(callback: (tx: DbTransaction) => Promise<T>) {
    return db.transaction(callback);
  }

  async getInventoryForUpdateTx(tx: DbTransaction, productId: string) {
    const [row] = await tx.select().from(inventory).where(eq(inventory.productId, productId)).for("update");
    return row ?? null;
  }

  async updateStockAndReservedTx(
    tx: DbTransaction,
    payload: {
      productId: string;
      stockQuantity: number;
      reservedStock: number;
      actorUserId: string;
    },
  ) {
    const [updated] = await tx
      .update(inventory)
      .set({
        stockQuantity: payload.stockQuantity,
        reservedStock: payload.reservedStock,
        updatedBy: payload.actorUserId,
      })
      .where(eq(inventory.productId, payload.productId))
      .returning();

    return updated ?? null;
  }

  async decrementStockTx(tx: DbTransaction, payload: { productId: string; quantity: number; actorUserId: string }) {
    const [updated] = await tx
      .update(inventory)
      .set({
        stockQuantity: sql`${inventory.stockQuantity} - ${payload.quantity}`,
        updatedBy: payload.actorUserId,
      })
      .where(and(eq(inventory.productId, payload.productId), sql`${inventory.stockQuantity} >= ${payload.quantity}`))
      .returning();
    return updated ?? null;
  }

  async incrementStockTx(tx: DbTransaction, payload: { productId: string; quantity: number; actorUserId: string }) {
    const [updated] = await tx
      .update(inventory)
      .set({
        stockQuantity: sql`${inventory.stockQuantity} + ${payload.quantity}`,
        updatedBy: payload.actorUserId,
      })
      .where(eq(inventory.productId, payload.productId))
      .returning();
    return updated ?? null;
  }

  async insertInventoryLogTx(
    tx: DbTransaction,
    payload: {
      productId: string;
      source: "pos_sale" | "ecommerce_order" | "manual_adjustment" | "refund";
      reason: "sale" | "restock" | "adjustment" | "refund" | "damage" | "return" | "correction";
      quantityBefore: number;
      quantityChange: number;
      quantityAfter: number;
      actorUserId: string;
      notes?: string;
      referenceOrderId?: string;
    },
  ) {
    await tx.insert(inventoryLogs).values({
      productId: payload.productId,
      source: payload.source,
      reason: payload.reason,
      quantityBefore: payload.quantityBefore,
      quantityChange: payload.quantityChange,
      quantityAfter: payload.quantityAfter,
      actorUserId: payload.actorUserId,
      notes: payload.notes,
      referenceOrderId: payload.referenceOrderId,
    });
  }
}

export const inventoryRepository = new InventoryRepository();
