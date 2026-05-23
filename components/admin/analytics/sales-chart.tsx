"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategorySalesRow } from "@/features/admin-analytics/types/analytics.types";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { CHART_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type SalesChartProps = {
  data: CategorySalesRow[];
};

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((row) => ({
    name: row.categoryName.length > 14 ? `${row.categoryName.slice(0, 12)}…` : row.categoryName,
    revenue: Number(row.revenue),
  }));

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Sales by Category</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">Category performance</p>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#1A1246", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#1A1246", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatInrFull(v)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7dcc2",
                background: "rgba(252, 250, 247, 0.95)",
              }}
              formatter={(value) => [formatInrFull(Number(value ?? 0)), "Revenue"]}
            />
            <Bar dataKey="revenue" fill={CHART_COLORS.gold} radius={[8, 8, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
