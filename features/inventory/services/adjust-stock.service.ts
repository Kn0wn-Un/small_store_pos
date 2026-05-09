import { adjustInventorySchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";
import { auditRepository } from "@/features/audit/repositories/audit.repository";

export class AdjustStockService {
  async execute(payload: unknown, actor: InventoryActor): Promise<InventoryResult> {
    const parsed = adjustInventorySchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid stock adjustment payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
      };
    }

    return inventoryRepository.withTransaction(async (tx) => {
      const row = await inventoryRepository.getInventoryForUpdateTx(tx, parsed.data.productId);
      if (!row) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }

      const change = parsed.data.newStockQuantity - row.stockQuantity;

      const updated = await inventoryRepository.updateStockAndReservedTx(tx, {
        productId: parsed.data.productId,
        stockQuantity: parsed.data.newStockQuantity,
        reservedStock: Math.min(row.reservedStock, parsed.data.newStockQuantity),
        actorUserId: actor.userId,
      });

      if (!updated) {
        return { success: false, message: "Stock adjustment failed.", data: null, errors: [{ field: "quantity", message: "Unable to adjust stock." }] };
      }

      await inventoryRepository.insertInventoryLogTx(tx, {
        productId: parsed.data.productId,
        source: parsed.data.source,
        reason: parsed.data.reason,
        quantityBefore: row.stockQuantity,
        quantityChange: change,
        quantityAfter: updated.stockQuantity,
        actorUserId: actor.userId,
        notes: parsed.data.notes,
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
        message: "Stock adjusted successfully.",
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

export const adjustStockService = new AdjustStockService();
