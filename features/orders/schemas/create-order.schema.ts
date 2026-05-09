import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  source: z.enum(["pos", "ecommerce"]),
  subtotalAmount: z.string(),
  taxAmount: z.string().default("0"),
  discountAmount: z.string().default("0"),
  totalAmount: z.string(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPriceSnapshot: z.string(),
        lineSubtotal: z.string(),
      }),
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
