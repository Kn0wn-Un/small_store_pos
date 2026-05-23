"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LowStockRow } from "@/features/admin-analytics/types/analytics.types";
import { CHART_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type InventoryChartProps = {
  data: LowStockRow[];
};

export function InventoryChart({ data }: InventoryChartProps) {
  const chartData = data.slice(0, 6).map((row) => ({
    name: row.productName.length > 12 ? `${row.productName.slice(0, 10)}…` : row.productName,
    stock: row.stockQuantity,
    threshold: row.lowStockThreshold,
    critical: row.stockQuantity <= 0,
  }));

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Inventory Levels</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">Low stock products</p>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: "#1A1246", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fill: "#1A1246", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7dcc2",
                background: "rgba(252, 250, 247, 0.95)",
              }}
            />
            <Bar dataKey="stock" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.critical ? "#DC2626" : CHART_COLORS.gold} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
