import { PRODUCT_DECIMAL_PRECISION_REGEX } from "../constants/product.constants";

export function validatePrice(value: string) {
  const trimmed = value.trim();
  const numeric = Number(trimmed);

  if (!PRODUCT_DECIMAL_PRECISION_REGEX.test(trimmed)) {
    return {
      isValid: false,
      message: "Price must be a valid decimal with up to 2 digits.",
    };
  }

  if (!Number.isFinite(numeric) || numeric < 0) {
    return {
      isValid: false,
      message: "Price must be greater than or equal to 0.",
    };
  }

  return {
    isValid: true,
    normalized: numeric.toFixed(2),
  };
}
