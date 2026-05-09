export function ensureNonNegativeQuantity(quantity: number) {
  return Number.isInteger(quantity) && quantity >= 0;
}

export function ensurePositiveQuantity(quantity: number) {
  return Number.isInteger(quantity) && quantity > 0;
}
