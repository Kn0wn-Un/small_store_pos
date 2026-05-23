import { z } from "zod";

export const salesHistoryFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  datePreset: z.enum(["today", "7d", "30d", "custom"]).default("30d"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  paymentStatus: z.enum(["paid", "pending", "failed", "refunded"]).optional(),
  orderStatus: z.enum(["completed", "cancelled", "refunded"]).optional(),
  cashierId: z.string().uuid().optional(),
});

export type SalesHistoryFilterInput = z.infer<typeof salesHistoryFilterSchema>;
