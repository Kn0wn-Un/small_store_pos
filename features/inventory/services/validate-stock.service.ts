import { inventoryRepository } from "../repositories/inventory.repository";
import type { InventoryResult } from "../types/inventory.types";

export class ValidateStockService {
  async execute(payload: { productId: string; quantity: number }): Promise<InventoryResult> {
    return inventoryRepository.withTransaction(async (tx) => {
      const row = await inventoryRepository.getInventoryForUpdateTx(tx, payload.productId);
      if (!row) {
        return {
          success: false,
          message: "Inventory row not found.",
          data: null,
          errors: [{ field: "productId", message: "No inventory found.", code: "NOT_FOUND" }],
        };
      }

      if (row.stockQuantity < payload.quantity) {
        return {
          success: false,
          message: "Insufficient stock.",
          data: null,
          errors: [{ field: "quantity", message: "Stock is lower than requested quantity.", code: "INSUFFICIENT_STOCK" }],
        };
      }

      return {
        success: true,
        message: "Stock is available.",
        data: {
          productId: row.productId,
          stockQuantity: row.stockQuantity,
          reservedStock: row.reservedStock,
          updatedAt: row.updatedAt,
        },
      };
    });
  }
}

export const validateStockService = new ValidateStockService();
