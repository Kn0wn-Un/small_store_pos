"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LowStockRow } from "@/features/admin-analytics/types/analytics.types";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type LowStockAlertsProps = {
  items: LowStockRow[];
};

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card rounded-2xl p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="heading-font text-xl font-bold text-[#2C3E57]">Low Stock Alerts</h3>
          <p className="text-sm text-[#1A1246]/60">Inventory warnings</p>
        </div>
        <Link href="/admin/inventory" className="text-sm font-medium text-[#B69224] hover:underline">
          View inventory
        </Link>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">All stock levels healthy.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#e7dcc2]/80 bg-white/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 ${item.stockQuantity <= 0 ? "text-red-600" : "text-amber-600"}`}
                />
                <span className="truncate text-sm font-medium text-[#2C3E57]">{item.productName}</span>
              </div>
              <Badge
                className={
                  item.stockQuantity <= 0
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }
              >
                {item.stockQuantity} / {item.lowStockThreshold}
              </Badge>
            </li>
          ))
        )}
      </ul>
    </article>
  );
}
