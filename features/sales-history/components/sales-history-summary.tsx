"use client";

import { IndianRupee, Receipt, ShoppingBag, Sun } from "lucide-react";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";
import { cn } from "@/lib/utils";
import type { SalesHistorySummary } from "../types/sales-history.types";

type SalesHistorySummaryProps = {
  summary: SalesHistorySummary;
};

const CARDS = [
  { key: "totalRevenue" as const, label: "Total Revenue", icon: IndianRupee },
  { key: "ordersCount" as const, label: "Orders", icon: ShoppingBag, format: "count" as const },
  { key: "averageOrderValue" as const, label: "Average Order Value", icon: Receipt },
  { key: "todaysSales" as const, label: "Today's Sales", icon: Sun },
];

export function SalesHistorySummaryCards({ summary }: SalesHistorySummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, format }) => {
        const value =
          key === "ordersCount"
            ? summary.ordersCount.toLocaleString("en-IN")
            : formatInrFull(summary[key]);

        return (
          <article
            key={key}
            className={cn(
              ANALYTICS_CARD_CLASS,
              "hover-glow shadcn-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5",
            )}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE6D7] text-[#B69224] transition group-hover:bg-[#2C3E57] group-hover:text-[#B69224]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium tracking-wide text-[#1A1246]/60 uppercase">{label}</p>
            <p className="heading-font mt-1 text-3xl font-bold text-[#2C3E57]">
              {format === "count" ? value : value}
            </p>
          </article>
        );
      })}
    </div>
  );
}
