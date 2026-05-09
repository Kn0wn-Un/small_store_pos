import { toMoney } from "./money";

export function calculateTaxAmount(subtotal: string | number, taxPercentage: string | number) {
  const base = Number(subtotal);
  const rate = Number(taxPercentage);
  return toMoney((base * rate) / 100);
}
