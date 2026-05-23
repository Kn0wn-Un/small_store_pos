"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PaymentBreakdownRow } from "@/features/admin-analytics/types/analytics.types";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { DONUT_COLORS } from "./chart-theme";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type PaymentBreakdownProps = {
  data: PaymentBreakdownRow[];
};

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
  const chartData = data.map((row) => ({
    name: row.method,
    value: Number(row.amount),
    count: row.count,
  }));

  if (chartData.length === 0) {
    return (
      <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
        <h3 className="heading-font text-xl font-bold text-[#2C3E57]">Payment Methods</h3>
        <p className="mt-4 text-sm text-[#1A1246]/60">No payment data for this period.</p>
      </article>
    );
  }

  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Payment Methods</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">Revenue by payment type</p>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatInrFull(Number(value ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1">
        {chartData.map((row, i) => (
          <li key={row.name} className="flex justify-between text-sm">
            <span className="text-[#2C3E57]">{row.name}</span>
            <span className="font-medium text-[#B69224]">{row.count} txns</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
