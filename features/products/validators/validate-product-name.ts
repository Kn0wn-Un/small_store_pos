import { PRODUCT_NAME_MAX_LENGTH, PRODUCT_NAME_MIN_LENGTH } from "../constants/product.constants";

export function validateProductName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return { isValid: false, message: "Product name is required." };
  }

  if (normalized.length < PRODUCT_NAME_MIN_LENGTH || normalized.length > PRODUCT_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Product name must be between ${PRODUCT_NAME_MIN_LENGTH} and ${PRODUCT_NAME_MAX_LENGTH} characters.`,
    };
  }

  return { isValid: true, normalized };
}
