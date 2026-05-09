import { z } from "zod";

export const addToCartSchema = z.object({
  userId: z.string().uuid().optional(),
  source: z.enum(["pos", "ecommerce"]).default("pos"),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.string(),
  taxPercentage: z.string().optional().default("0"),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
});

export const getCartSchema = z.object({
  cartId: z.string().uuid(),
});

export const clearCartSchema = z.object({
  cartId: z.string().uuid(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
