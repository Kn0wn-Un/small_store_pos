"use client";

import dynamic from "next/dynamic";
import { useAnalyticsStagger } from "@/features/admin-analytics/hooks/use-analytics-animation";
import { useAnalyticsDashboard } from "@/features/admin-analytics/hooks/use-analytics-dashboard";
import type { AdminAnalyticsDashboard } from "@/features/admin-analytics/types/analytics.types";
import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsKpiGrid } from "./analytics-kpi-grid";
import { AnalyticsLayout } from "./analytics-layout";
import { AnalyticsActivityFeed } from "./analytics-activity-feed";
import { LowStockAlerts } from "./low-stock-alerts";
import { RecentOrders } from "./recent-orders";
import { AnalyticsLoadingSkeleton } from "./analytics-loading-skeleton";

const RevenueChart = dynamic(() => import("./revenue-chart").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="shadcn-card h-[320px] animate-pulse rounded-2xl" />,
});
const TopProducts = dynamic(() => import("./top-products").then((m) => m.TopProducts), { ssr: false });
const SalesChart = dynamic(() => import("./sales-chart").then((m) => m.SalesChart), { ssr: false });
const OrderChart = dynamic(() => import("./order-chart").then((m) => m.OrderChart), { ssr: false });
const InventoryChart = dynamic(() => import("./inventory-chart").then((m) => m.InventoryChart), { ssr: false });
const PaymentBreakdown = dynamic(() => import("./payment-breakdown").then((m) => m.PaymentBreakdown), {
  ssr: false,
});

type AnalyticsDashboardProps = {
  initialDashboard: AdminAnalyticsDashboard;
  userEmail: string;
  initialFrom: string;
  initialTo: string;
};

export function AnalyticsDashboard({
  initialDashboard,
  userEmail,
  initialFrom,
  initialTo,
}: AnalyticsDashboardProps) {
  const { dashboard, preset, isPending, loadRange } = useAnalyticsDashboard(
    initialDashboard,
    initialFrom,
    initialTo,
  );

  const staggerRef = useAnalyticsStagger([dashboard, isPending]);

  return (
    <AnalyticsLayout>
      <AnalyticsHeader
        userEmail={userEmail}
        pendingOrdersCount={dashboard.pendingOrdersCount}
        preset={preset}
        onPresetChange={loadRange}
        filtersDisabled={isPending}
      />

      {isPending ? (
        <AnalyticsLoadingSkeleton />
      ) : (
        <div ref={staggerRef} className="space-y-6">
          <AnalyticsKpiGrid kpis={dashboard.kpis} />

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart data={dashboard.dailySales} />
            </div>
            <TopProducts products={dashboard.topProducts} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentOrders orders={dashboard.recentOrders} />
            <SalesChart data={dashboard.categorySales} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <OrderChart data={dashboard.sourceSplit} />
            <PaymentBreakdown data={dashboard.paymentBreakdown} />
            <InventoryChart data={dashboard.lowInventory} />
            <LowStockAlerts items={dashboard.lowInventory} />
          </div>

          <AnalyticsActivityFeed alerts={dashboard.alerts} />
        </div>
      )}
    </AnalyticsLayout>
  );
}
