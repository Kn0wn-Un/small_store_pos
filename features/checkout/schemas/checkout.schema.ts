import { z } from "zod";

export const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  customerId: z.string().uuid(),
  source: z.enum(["pos", "ecommerce"]),
  addressId: z.string().uuid().optional(),
  paymentProvider: z.enum(["cash", "upi", "card"]),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer"]),
  transactionId: z.string().max(150).optional(),
  discountAmount: z.string().optional().default("0"),
});
