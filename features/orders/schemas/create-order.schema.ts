import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  source: z.enum(["pos", "ecommerce"]),
  paymentProvider: z.enum(["cash", "upi", "card"]),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "partially_refunded"]).default("paid"),
  transactionId: z.string().max(150).optional(),
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
        taxPercentageSnapshot: z.string().default("0"),
        lineSubtotal: z.string(),
      }),
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
