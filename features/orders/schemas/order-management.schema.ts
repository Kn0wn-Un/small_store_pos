import { z } from "zod";

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const getOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "processing", "delivered", "cancelled", "refunded"]),
});
