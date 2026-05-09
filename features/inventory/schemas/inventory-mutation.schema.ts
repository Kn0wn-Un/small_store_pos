import { z } from "zod";

export const inventoryMutationSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.enum(["sale", "restock", "adjustment", "refund", "damage", "return", "correction"]),
  source: z.enum(["pos_sale", "ecommerce_order", "manual_adjustment", "refund"]),
  notes: z.string().max(500).optional(),
  referenceOrderId: z.string().uuid().optional(),
});

export const adjustInventorySchema = z.object({
  productId: z.string().uuid(),
  newStockQuantity: z.number().int().min(0),
  reason: z.enum(["adjustment", "correction", "damage", "return", "restock"]),
  source: z.enum(["manual_adjustment"]),
  notes: z.string().max(500).optional(),
});

export type InventoryMutationInput = z.infer<typeof inventoryMutationSchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
