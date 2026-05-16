import { inventoryMutationSchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";

export class ReleaseStockService {
  async execute(payload: unknown, actor: InventoryActor): Promise<InventoryResult> {
    const parsed = inventoryMutationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid release stock payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
      };
    }

    try {
      const updated = await inventoryRepository.adjustInventoryAtomic({
        operation: "release",
        productId: parsed.data.productId,
        actorUserId: actor.userId,
        quantity: parsed.data.quantity,
        source: parsed.data.source,
        notes: parsed.data.notes,
        referenceOrderId: parsed.data.referenceOrderId,
      });

      return {
        success: true,
        message: "Reserved stock released successfully.",
        data: {
          productId: updated.productId,
          stockQuantity: updated.stockQuantity,
          reservedStock: updated.reservedStock,
          updatedAt: updated.updatedAt,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Release stock failed.";
      if (message.includes("INVENTORY_NOT_FOUND")) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }
      return { success: false, message: "Release stock failed.", data: null, errors: [{ field: "quantity", message: "Failed to release reserved stock." }] };
    }
  }
}

export const releaseStockService = new ReleaseStockService();
