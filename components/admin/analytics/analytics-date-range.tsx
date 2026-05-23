"use client";

import { cn } from "@/lib/utils";
import type { DateRangePreset } from "@/features/admin-analytics/utils/analytics-date";

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "month", label: "This Month" },
  { value: "90d", label: "90 Days" },
];

type AnalyticsDateRangeProps = {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
  disabled?: boolean;
};

export function AnalyticsDateRange({ value, onChange, disabled }: AnalyticsDateRangeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(preset.value)}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            value === preset.value
              ? "bg-[#2C3E57] text-white shadow-md"
              : "bg-white/80 text-[#2C3E57] hover:bg-[#2C3E57]/10",
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
