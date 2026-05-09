export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}
