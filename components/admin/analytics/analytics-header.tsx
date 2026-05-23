"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnalyticsFilters } from "./analytics-filters";
import type { DateRangePreset } from "@/features/admin-analytics/utils/analytics-date";

type AnalyticsHeaderProps = {
  userEmail: string;
  pendingOrdersCount: number;
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  filtersDisabled?: boolean;
};

export function AnalyticsHeader({
  userEmail,
  pendingOrdersCount,
  preset,
  onPresetChange,
  filtersDisabled,
}: AnalyticsHeaderProps) {
  const initial = (userEmail.charAt(0) || "A").toUpperCase();
  const displayName = userEmail.split("@")[0] ?? "Admin";

  return (
    <header className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="heading-font text-4xl font-bold text-[#2C3E57]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#1A1246]/60">Overview of your store performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative hidden min-w-[200px] flex-1 md:block lg:max-w-xs">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#2C3E57]/40" />
            <Input
              placeholder="Search anything..."
              className="h-10 rounded-xl border-[#d9cfb7] bg-white/80 pl-10"
            />
          </div>
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7dcc2] bg-white/80 text-[#2C3E57]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {pendingOrdersCount > 0 ? (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full gold-bg px-1 text-[10px] text-[#2C3E57]">
                {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
              </Badge>
            ) : null}
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-[#e7dcc2] bg-white/80 px-3 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2C3E57] text-sm font-bold text-white">
              {initial}
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold capitalize text-[#2C3E57]">{displayName}</p>
              <p className="text-xs text-[#1A1246]/60">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#1A1246]/50" />
          </div>
        </div>
      </div>
      <AnalyticsFilters preset={preset} onPresetChange={onPresetChange} disabled={filtersDisabled} />
    </header>
  );
}
