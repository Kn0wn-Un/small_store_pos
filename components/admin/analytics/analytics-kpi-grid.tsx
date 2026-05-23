"use client";

import {
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
  RotateCcw,
  Receipt,
} from "lucide-react";
import type { AnalyticsKpi } from "@/features/admin-analytics/types/analytics.types";
import { AnalyticsMetricsCard } from "./analytics-metrics-card";

const KPI_ICONS: Record<string, React.ReactNode> = {
  revenue: <IndianRupee className="h-5 w-5" />,
  orders: <ShoppingBag className="h-5 w-5" />,
  netProfit: <TrendingUp className="h-5 w-5" />,
  aov: <Receipt className="h-5 w-5" />,
  inventoryValue: <Warehouse className="h-5 w-5" />,
  productsSold: <Package className="h-5 w-5" />,
  customers: <Users className="h-5 w-5" />,
  refunds: <RotateCcw className="h-5 w-5" />,
};

type AnalyticsKpiGridProps = {
  kpis: AnalyticsKpi[];
};

export function AnalyticsKpiGrid({ kpis }: AnalyticsKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <AnalyticsMetricsCard key={kpi.key} kpi={kpi} icon={KPI_ICONS[kpi.key] ?? <ShoppingBag className="h-5 w-5" />} />
      ))}
    </div>
  );
}
