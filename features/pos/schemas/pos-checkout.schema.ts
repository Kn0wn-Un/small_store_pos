import { z } from "zod";

export const posCheckoutSchema = z.object({
  customerId: z.string().uuid(),
  paymentProvider: z.enum(["cash", "upi", "card"]),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer"]),
  transactionId: z.string().max(150).optional(),
  discountAmount: z.string().optional().default("0"),
});

export type PosCheckoutInput = z.infer<typeof posCheckoutSchema>;
