"use server";

import { z } from "zod";
import { validateStockService } from "../services/validate-stock.service";

const validateStockInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export async function validateStockAction(payload: unknown) {
  const parsed = validateStockInputSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid stock validation payload.",
      data: null,
      errors: [{ field: "payload", message: "Invalid payload.", code: "VALIDATION_ERROR" }],
    };
  }
  return validateStockService.execute(parsed.data);
}
