import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(["cash", "upi", "card"]),
  method: z.enum(["cash", "upi", "card", "bank_transfer"]),
  amount: z.string(),
  transactionId: z.string().max(150).optional(),
  status: z.enum(["pending", "paid", "failed", "refunded", "partially_refunded"]).default("pending"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid(),
  status: z.enum(["pending", "paid", "failed", "refunded", "partially_refunded"]),
});
