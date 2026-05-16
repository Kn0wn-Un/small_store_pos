import { inventoryMutationSchema } from "../schemas/inventory-mutation.schema";
import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryActor, InventoryResult } from "../types/inventory.types";

export class DecrementStockService {
  async execute(payload: unknown, actor: InventoryActor): Promise<InventoryResult> {
    const parsed = inventoryMutationSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid stock decrement payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
      };
    }

    try {
      const updated = await inventoryRepository.adjustInventoryAtomic({
        operation: "decrement",
        productId: parsed.data.productId,
        actorUserId: actor.userId,
        quantity: parsed.data.quantity,
        source: parsed.data.source,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
        referenceOrderId: parsed.data.referenceOrderId,
      });

      return {
        success: true,
        message: "Stock decremented successfully.",
        data: {
          productId: updated.productId,
          stockQuantity: updated.stockQuantity,
          reservedStock: updated.reservedStock,
          updatedAt: updated.updatedAt,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stock decrement failed.";
      if (message.includes("INVENTORY_NOT_FOUND")) {
        return { success: false, message: "Inventory row not found.", data: null, errors: [{ field: "productId", message: "No inventory row found." }] };
      }
      if (message.includes("INSUFFICIENT_STOCK")) {
        return { success: false, message: "Insufficient stock.", data: null, errors: [{ field: "quantity", message: "Insufficient stock." }] };
      }
      return { success: false, message: "Stock update failed.", data: null, errors: [{ field: "quantity", message: "Concurrent stock update failed." }] };
    }
  }
}

export const decrementStockService = new DecrementStockService();
