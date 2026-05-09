import { z } from "zod";
import {
  PRODUCT_DECIMAL_PRECISION_REGEX,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
} from "../constants/product.constants";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(PRODUCT_NAME_MIN_LENGTH)
    .max(PRODUCT_NAME_MAX_LENGTH)
    .transform((value) => value.trim()),
  description: z
    .string()
    .max(PRODUCT_DESCRIPTION_MAX_LENGTH)
    .optional()
    .nullable()
    .transform((value) => (value ? value.trim() : null)),
  categoryId: z.string().uuid("Invalid category."),
  imageUrl: z
    .string()
    .url("Image URL must be a valid URL.")
    .optional()
    .nullable(),
  salePrice: z
    .string()
    .trim()
    .regex(PRODUCT_DECIMAL_PRECISION_REGEX, "Price can have up to 2 decimal places.")
    .refine((value) => Number(value) >= 0, "Price must be greater than or equal to 0."),
  isActive: z.boolean().optional().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
