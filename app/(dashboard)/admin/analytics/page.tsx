import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
import { loadAdminAnalyticsPageData } from "@/features/admin-analytics/services/load-admin-analytics.service";

export default async function AdminAnalyticsPage() {
  const data = await loadAdminAnalyticsPageData();
  if (!data) redirect("/login");

  return (
    <AnalyticsDashboard
      initialDashboard={data.dashboard}
      userEmail={data.session.email}
      initialFrom={data.from}
      initialTo={data.to}
    />
  );
}
