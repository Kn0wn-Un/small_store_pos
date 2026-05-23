"use client";

import { AnalyticsDateRange } from "./analytics-date-range";
import type { DateRangePreset } from "@/features/admin-analytics/utils/analytics-date";

type AnalyticsFiltersProps = {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  disabled?: boolean;
};

export function AnalyticsFilters({ preset, onPresetChange, disabled }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AnalyticsDateRange value={preset} onChange={onPresetChange} disabled={disabled} />
    </div>
  );
}
