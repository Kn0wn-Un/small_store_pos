"use server";

import { z } from "zod";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { analyticsService } from "../services/analytics.service";

const analyticsInputSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export async function getDashboardMetricsAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return auth;

  const parsed = analyticsInputSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid analytics input.",
      data: null,
      errors: [{ field: "payload", message: "Invalid date range." }],
    };
  }

  return analyticsService.dashboard(new Date(parsed.data.from), new Date(parsed.data.to));
}
