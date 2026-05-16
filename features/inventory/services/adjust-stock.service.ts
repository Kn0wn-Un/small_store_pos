import { adjustInventorySchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";

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

    try {
      const updated = await inventoryRepository.adjustInventoryAtomic({
        operation: "adjust",
        productId: parsed.data.productId,
        actorUserId: actor.userId,
        newStockQuantity: parsed.data.newStockQuantity,
        source: parsed.data.source,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stock adjustment failed.";
      if (message.includes("INVENTORY_NOT_FOUND")) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }
      return { success: false, message: "Stock adjustment failed.", data: null, errors: [{ field: "quantity", message: "Unable to adjust stock." }] };
    }
  }
}

export const adjustStockService = new AdjustStockService();
