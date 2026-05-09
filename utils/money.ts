export function toMoney(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

export function addMoney(...values: Array<string | number>) {
  const total = values.reduce<number>((sum, value) => sum + Number(value), 0);
  return toMoney(total);
}

export function subtractMoney(base: string | number, ...values: Array<string | number>) {
  const total = Number(base) - values.reduce<number>((sum, value) => sum + Number(value), 0);
  return toMoney(total);
}
