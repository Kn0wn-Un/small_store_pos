export function formatPosPrice(value: string | number) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0.00";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function toPosSku(productId: string) {
  return productId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
