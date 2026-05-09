import { inventoryMutationSchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";
import { auditRepository } from "@/features/audit/repositories/audit.repository";

export class IncrementStockService {
  async execute(payload: unknown, actor: InventoryActor): Promise<InventoryResult> {
    const parsed = inventoryMutationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid stock increment payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
      };
    }

    return inventoryRepository.withTransaction(async (tx) => {
      const row = await inventoryRepository.getInventoryForUpdateTx(tx, parsed.data.productId);
      if (!row) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }

      const updated = await inventoryRepository.incrementStockTx(tx, {
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
        actorUserId: actor.userId,
      });

      if (!updated) {
        return { success: false, message: "Stock update failed.", data: null, errors: [{ field: "quantity", message: "Unable to increment stock." }] };
      }

      await inventoryRepository.insertInventoryLogTx(tx, {
        productId: parsed.data.productId,
        source: parsed.data.source,
        reason: parsed.data.reason,
        quantityBefore: row.stockQuantity,
        quantityChange: parsed.data.quantity,
        quantityAfter: updated.stockQuantity,
        actorUserId: actor.userId,
        notes: parsed.data.notes,
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
        message: "Stock incremented successfully.",
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

export const incrementStockService = new IncrementStockService();
