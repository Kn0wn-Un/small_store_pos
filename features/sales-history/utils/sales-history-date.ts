import type { SalesHistoryDatePreset } from "../types/sales-history.types";

export function resolveSalesHistoryDateRange(
  preset: SalesHistoryDatePreset,
  from?: string,
  to?: string,
): { from: Date; to: Date } {
  const now = new Date();
  const end = to ? new Date(to) : now;

  if (preset === "custom" && from) {
    return { from: new Date(from), to: end };
  }

  const start = new Date(end);
  if (preset === "today") {
    start.setHours(0, 0, 0, 0);
    return { from: start, to: end };
  }
  if (preset === "7d") {
    start.setDate(start.getDate() - 7);
    return { from: start, to: end };
  }
  if (preset === "30d") {
    start.setDate(start.getDate() - 30);
    return { from: start, to: end };
  }

  if (from) {
    return { from: new Date(from), to: end };
  }

  start.setDate(start.getDate() - 30);
  return { from: start, to: end };
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
