"use client";

import { AlertCircle, Info, TriangleAlert } from "lucide-react";
import type { AnalyticsAlert } from "@/features/admin-analytics/types/analytics.types";
import { cn } from "@/lib/utils";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type AnalyticsActivityFeedProps = {
  alerts: AnalyticsAlert[];
};

const ICONS = {
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

export function AnalyticsActivityFeed({ alerts }: AnalyticsActivityFeedProps) {
  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <h3 className="heading-font mb-1 text-xl font-bold text-[#2C3E57]">Activity & Alerts</h3>
      <p className="mb-4 text-sm text-[#1A1246]/60">Recent system notifications</p>
      <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <li className="rounded-xl bg-[#EFE6D7]/50 px-4 py-3 text-sm text-[#1A1246]/70">No alerts right now.</li>
        ) : (
          alerts.map((alert) => {
            const Icon = ICONS[alert.severity];
            return (
              <li
                key={alert.id}
                className={cn(
                  "flex gap-3 rounded-xl border px-4 py-3",
                  alert.severity === "error"
                    ? "border-red-200 bg-red-50/80"
                    : alert.severity === "warning"
                      ? "border-amber-200 bg-amber-50/80"
                      : "border-[#e7dcc2] bg-white/60",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    alert.severity === "error"
                      ? "text-red-600"
                      : alert.severity === "warning"
                        ? "text-amber-600"
                        : "text-[#2C3E57]",
                  )}
                />
                <div>
                  <p className="text-sm font-semibold text-[#2C3E57]">{alert.title}</p>
                  <p className="text-xs text-[#1A1246]/65">{alert.description}</p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </article>
  );
}
