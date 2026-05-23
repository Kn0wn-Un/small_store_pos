"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TopProductRow } from "@/features/admin-analytics/types/analytics.types";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { CHART_COLORS, DONUT_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type TopProductsProps = {
  products: TopProductRow[];
};

export function TopProducts({ products }: TopProductsProps) {
  const chartData = products.slice(0, 4).map((p) => ({
    name: p.productName,
    value: Number(p.revenue),
  }));

  const totalRevenue = chartData.reduce((sum, row) => sum + row.value, 0);

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Top Products</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">Revenue share by product</p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-[220px] w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatInrFull(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-[#1A1246]/60 uppercase">Total Sales</p>
            <p className="heading-font text-lg font-bold text-[#2C3E57]">{formatInrFull(totalRevenue)}</p>
          </div>
        </div>
        <ul className="flex-1 space-y-3">
          {chartData.map((row, index) => {
            const pct = totalRevenue > 0 ? Math.round((row.value / totalRevenue) * 100) : 0;
            return (
              <li key={row.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                  />
                  <span className="text-[#2C3E57]">{row.name}</span>
                </span>
                <span className="font-semibold text-[#B69224]">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
