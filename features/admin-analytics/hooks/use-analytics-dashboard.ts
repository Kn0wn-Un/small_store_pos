"use client";

import { useCallback, useState, useTransition } from "react";
import { getAdminAnalyticsAction } from "../actions/get-admin-analytics.action";
import { getDateRangeForPreset, type DateRangePreset } from "../utils/analytics-date";
import type { AdminAnalyticsDashboard } from "../types/analytics.types";

export function useAnalyticsDashboard(
  initial: AdminAnalyticsDashboard,
  initialFrom: string,
  initialTo: string,
) {
  const [dashboard, setDashboard] = useState(initial);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [preset, setPreset] = useState<DateRangePreset>("30d");
  const [isPending, startTransition] = useTransition();

  const loadRange = useCallback((nextPreset: DateRangePreset) => {
    const range = getDateRangeForPreset(nextPreset);
    setPreset(nextPreset);
    setFrom(range.from.toISOString());
    setTo(range.to.toISOString());

    startTransition(async () => {
      const result = await getAdminAnalyticsAction({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        preset: nextPreset,
      });
      if (result.success && result.data) {
        setDashboard(result.data);
      }
    });
  }, []);

  return { dashboard, from, to, preset, isPending, loadRange };
}
