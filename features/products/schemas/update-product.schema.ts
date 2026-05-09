import { z } from "zod";
import {
  PRODUCT_DECIMAL_PRECISION_REGEX,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
} from "../constants/product.constants";

export const updateProductSchema = z
  .object({
    id: z.string().uuid("Invalid product id."),
    name: z.string().min(PRODUCT_NAME_MIN_LENGTH).max(PRODUCT_NAME_MAX_LENGTH).optional(),
    description: z.string().max(PRODUCT_DESCRIPTION_MAX_LENGTH).optional().nullable(),
    categoryId: z.string().uuid("Invalid category.").optional(),
    imageUrl: z.string().url("Image URL must be valid.").optional().nullable(),
    salePrice: z
      .string()
      .trim()
      .regex(PRODUCT_DECIMAL_PRECISION_REGEX, "Price can have up to 2 decimal places.")
      .refine((value) => Number(value) >= 0, "Price must be greater than or equal to 0.")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.categoryId !== undefined ||
      value.imageUrl !== undefined ||
      value.salePrice !== undefined ||
      value.isActive !== undefined,
    {
      message: "At least one field is required for update.",
      path: ["id"],
    },
  );

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
