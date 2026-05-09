import { inventoryMutationSchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";
import { auditRepository } from "@/features/audit/repositories/audit.repository";

export class ReserveStockService {
  async execute(payload: unknown, actor: InventoryActor): Promise<InventoryResult> {
    const parsed = inventoryMutationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid reserve stock payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
      };
    }

    return inventoryRepository.withTransaction(async (tx) => {
      const row = await inventoryRepository.getInventoryForUpdateTx(tx, parsed.data.productId);
      if (!row) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }

      const availableStock = row.stockQuantity - row.reservedStock;
      if (availableStock < parsed.data.quantity) {
        return { success: false, message: "Insufficient available stock.", data: null, errors: [{ field: "quantity", message: "Not enough available stock to reserve." }] };
      }

      const updated = await inventoryRepository.updateStockAndReservedTx(tx, {
        productId: row.productId,
        stockQuantity: row.stockQuantity,
        reservedStock: row.reservedStock + parsed.data.quantity,
        actorUserId: actor.userId,
      });

      if (!updated) {
        return { success: false, message: "Reserve stock failed.", data: null, errors: [{ field: "quantity", message: "Failed to reserve stock." }] };
      }

      await inventoryRepository.insertInventoryLogTx(tx, {
        productId: parsed.data.productId,
        source: parsed.data.source,
        reason: "adjustment",
        quantityBefore: row.stockQuantity,
        quantityChange: 0,
        quantityAfter: row.stockQuantity,
        actorUserId: actor.userId,
        notes: parsed.data.notes ?? `Reserved quantity increased by ${parsed.data.quantity}.`,
        referenceOrderId: parsed.data.referenceOrderId,
      });

      await auditRepository.createLogTx(tx, {
        entityName: "inventory",
        entityId: row.id,
        action: "update",
        actorUserId: actor.userId,
        beforeState: { stockQuantity: row.stockQuantity, reservedStock: row.reservedStock },
        afterState: { stockQuantity: updated.stockQuantity, reservedStock: updated.reservedStock },
      });

      return {
        success: true,
        message: "Stock reserved successfully.",
        data: {
          productId: updated.productId,
          stockQuantity: updated.stockQuantity,
          reservedStock: updated.reservedStock,
          updatedAt: updated.updatedAt,
        },
      };
    });
  }
}

export const reserveStockService = new ReserveStockService();
