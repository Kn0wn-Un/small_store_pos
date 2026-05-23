"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { AnalyticsKpi } from "@/features/admin-analytics/types/analytics.types";
import { cn } from "@/lib/utils";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type AnalyticsMetricsCardProps = {
  kpi: AnalyticsKpi;
  icon: React.ReactNode;
};

function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

export function AnalyticsMetricsCard({ kpi, icon }: AnalyticsMetricsCardProps) {
  const animated = useAnimatedNumber(kpi.numericValue);
  const displayValue =
    kpi.format === "currency"
      ? `₹${Math.round(animated).toLocaleString("en-IN")}`
      : kpi.format === "percent"
        ? `${animated.toFixed(1)}%`
        : Math.round(animated).toLocaleString("en-IN");

  const trendUp = kpi.trendDirection === "up";
  const trendDown = kpi.trendDirection === "down";
  const invertTrend = kpi.key === "refunds" || kpi.key === "pending";

  return (
    <article
      className={cn(
        ANALYTICS_CARD_CLASS,
        "hover-glow shadcn-card group rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5",
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFE6D7] text-[#B69224] transition group-hover:bg-[#2C3E57] group-hover:text-[#B69224]">
          {icon}
        </div>
        {kpi.trendPercent !== null ? (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              (trendUp && !invertTrend) || (trendDown && invertTrend)
                ? "bg-emerald-50 text-emerald-700"
                : trendDown || trendUp
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-600",
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : trendDown ? <TrendingDown className="h-3 w-3" /> : null}
            {Math.abs(kpi.trendPercent)}%
          </span>
        ) : null}
      </div>
      <p className="text-xs font-medium tracking-wide text-[#1A1246]/60 uppercase">{kpi.label}</p>
      <p className="heading-font mt-1 text-3xl font-bold text-[#2C3E57]">{displayValue}</p>
      {kpi.trendPercent !== null ? (
        <p className="mt-2 text-xs text-[#1A1246]/50">vs previous period</p>
      ) : null}
    </article>
  );
}
