"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SourceSplitRow } from "@/features/admin-analytics/types/analytics.types";
import { CHART_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type OrderChartProps = {
  data: SourceSplitRow[];
};

export function OrderChart({ data }: OrderChartProps) {
  const chartData = data.map((row) => ({
    source: row.source === "pos" ? "POS" : "E-commerce",
    orders: row.ordersCount,
    revenue: Number(row.revenue),
  }));

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Order Volume</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">POS vs online channels</p>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="source" tick={{ fill: "#1A1246", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#1A1246", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7dcc2",
                background: "rgba(252, 250, 247, 0.95)",
              }}
            />
            <Legend />
            <Bar dataKey="orders" name="Orders" fill={CHART_COLORS.navy} radius={[6, 6, 0, 0]} />
            <Bar dataKey="revenue" name="Revenue (₹)" fill={CHART_COLORS.gold} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
