"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import type { ActionResult } from "@/types/action-result";
import { adminAnalyticsService } from "../services/admin-analytics.service";
import type { AdminAnalyticsDashboard } from "../types/analytics.types";

export async function getAdminAnalyticsAction(
  payload: unknown,
): Promise<ActionResult<AdminAnalyticsDashboard>> {
  const auth = await authorizeActionRole([ROLES.ADMIN]);
  if (!auth.success) {
    return { success: false, message: auth.message, data: null, errors: auth.errors };
  }

  return adminAnalyticsService.execute(payload);
}
