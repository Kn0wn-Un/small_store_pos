export type DateRangePreset = "7d" | "30d" | "90d" | "month";

export function getDateRangeForPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (preset) {
    case "7d":
      from.setDate(to.getDate() - 7);
      break;
    case "90d":
      from.setDate(to.getDate() - 90);
      break;
    case "month":
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case "30d":
    default:
      from.setDate(to.getDate() - 30);
      break;
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export function getPreviousPeriod(from: Date, to: Date): { from: Date; to: Date } {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: prevFrom, to: prevTo };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : current === 0 ? 0 : null;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function trendDirection(change: number | null): "up" | "down" | "neutral" {
  if (change === null || change === 0) return "neutral";
  return change > 0 ? "up" : "down";
}

export function formatChartDay(day: string) {
  const date = new Date(`${day}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatChartMonth(month: string) {
  const date = new Date(`${month}T00:00:00`);
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}
