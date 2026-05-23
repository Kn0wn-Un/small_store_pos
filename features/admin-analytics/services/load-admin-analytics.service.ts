import { getServerSession } from "@/lib/auth/session";
import { getDateRangeForPreset } from "../utils/analytics-date";
import { adminAnalyticsService } from "./admin-analytics.service";
import type { AdminAnalyticsDashboard } from "../types/analytics.types";

export async function loadAdminAnalyticsPageData(): Promise<{
  session: { email: string; role: string };
  dashboard: AdminAnalyticsDashboard;
  from: string;
  to: string;
} | null> {
  const session = await getServerSession();
  if (!session || session.role !== "admin") return null;

  const { from, to } = getDateRangeForPreset("30d");
  const dashboard = await adminAnalyticsService.getDashboard(from, to);

  return {
    session: { email: session.email, role: session.role },
    dashboard,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
