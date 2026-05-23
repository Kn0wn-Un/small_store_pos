export function formatInr(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatInrFull(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0.00";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function customerInitial(name: string) {
  return (name.trim().charAt(0) || "?").toUpperCase();
}
