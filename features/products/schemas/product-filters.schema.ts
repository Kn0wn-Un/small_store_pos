import { z } from "zod";
import {
  PRODUCT_DEFAULT_PAGE,
  PRODUCT_DEFAULT_PAGE_SIZE,
  PRODUCT_MAX_PAGE_SIZE,
} from "../constants/product.constants";

const optionalBooleanFilter = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return value;
}, z.boolean().optional());

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(PRODUCT_DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(PRODUCT_MAX_PAGE_SIZE).default(PRODUCT_DEFAULT_PAGE_SIZE),
  search: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: optionalBooleanFilter,
  storefrontOnly: z.coerce.boolean().optional().default(false),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
