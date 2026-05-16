import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryResult } from "../types/inventory.types";

export class ValidateStockService {
  async execute(payload: { productId: string; quantity: number }): Promise<InventoryResult> {
    try {
      const updated = await inventoryRepository.adjustInventoryAtomic({
        operation: "validate",
        productId: payload.productId,
        quantity: payload.quantity,
      });

      return {
        success: true,
        message: "Stock is available.",
        data: {
          productId: updated.productId,
          stockQuantity: updated.stockQuantity,
          reservedStock: updated.reservedStock,
          updatedAt: updated.updatedAt,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stock validation failed.";
      if (message.includes("INVENTORY_NOT_FOUND")) {
        return {
          success: false,
          message: "Inventory row not found.",
          data: null,
          errors: [{ field: "productId", message: "No inventory found.", code: "NOT_FOUND" }],
        };
      }
      if (message.includes("INSUFFICIENT_STOCK")) {
        return {
          success: false,
          message: "Insufficient stock.",
          data: null,
          errors: [{ field: "quantity", message: "Stock is lower than requested quantity.", code: "INSUFFICIENT_STOCK" }],
        };
      }
      return {
        success: false,
        message: "Stock validation failed.",
        data: null,
        errors: [{ field: "quantity", message: "Unable to validate stock.", code: "VALIDATION_ERROR" }],
      };
    }
  }
}

export const validateStockService = new ValidateStockService();
