import { z } from "zod";

export const analyticsFiltersSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  preset: z.enum(["7d", "30d", "90d", "month"]).optional(),
});

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;
