import { z } from "zod";

export const posProductFiltersSchema = z.object({
  search: z.string().max(120).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(48),
});

export type PosProductFiltersInput = z.infer<typeof posProductFiltersSchema>;
