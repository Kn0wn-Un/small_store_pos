import { inventoryMutationSchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";

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

    try {
      const updated = await inventoryRepository.adjustInventoryAtomic({
        operation: "reserve",
        productId: parsed.data.productId,
        actorUserId: actor.userId,
        quantity: parsed.data.quantity,
        source: parsed.data.source,
        notes: parsed.data.notes,
        referenceOrderId: parsed.data.referenceOrderId,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Reserve stock failed.";
      if (message.includes("INVENTORY_NOT_FOUND")) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }
      if (message.includes("INSUFFICIENT_AVAILABLE_STOCK")) {
        return { success: false, message: "Insufficient available stock.", data: null, errors: [{ field: "quantity", message: "Not enough available stock to reserve." }] };
      }
      return { success: false, message: "Reserve stock failed.", data: null, errors: [{ field: "quantity", message: "Failed to reserve stock." }] };
    }
  }
}

export const reserveStockService = new ReserveStockService();
