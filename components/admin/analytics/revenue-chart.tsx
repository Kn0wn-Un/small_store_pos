"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailySalesPoint } from "@/features/admin-analytics/types/analytics.types";
import { formatChartDay } from "@/features/admin-analytics/utils/analytics-date";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { CHART_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type RevenueChartProps = {
  data: DailySalesPoint[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((point) => ({
    label: formatChartDay(point.day),
    sales: Number(point.totalSales),
    tax: Number(point.totalTax),
  }));

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="heading-font text-xl font-bold text-[#2C3E57]">Sales Overview</h3>
          <p className="text-sm text-[#1A1246]/60">Daily revenue trend</p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#1A1246", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <Area
              type="monotone"
              dataKey="sales"
              stroke={CHART_COLORS.gold}
              strokeWidth={2.5}
              fill="url(#goldGradient)"
              dot={{ r: 3, fill: CHART_COLORS.gold, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART_COLORS.navy }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
