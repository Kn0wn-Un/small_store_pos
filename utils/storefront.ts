export function getInventoryBadge(stockQuantity: number, lowStockThreshold: number) {
  if (stockQuantity <= 0) {
    return { label: "Out Of Stock", className: "bg-red-100 text-red-700 border-red-200" };
  }
  if (stockQuantity <= lowStockThreshold) {
    return { label: "Low Stock", className: "bg-amber-100 text-amber-700 border-amber-200" };
  }
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}
