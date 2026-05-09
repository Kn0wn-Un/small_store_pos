import type { ProductError } from "../types/product.types";
import { validatePrice } from "../validators/validate-price";
import { validateProductName } from "../validators/validate-product-name";

export class ValidateProductService {
  normalizeName(rawName: string) {
    const validation = validateProductName(rawName);
    if (!validation.isValid) {
      return {
        success: false,
        errors: [{ field: "name", message: validation.message }] as ProductError[],
      };
    }

    return {
      success: true,
      normalizedName: validation.normalized,
    };
  }

  normalizePrice(rawPrice: string) {
    const validation = validatePrice(rawPrice);
    if (!validation.isValid) {
      return {
        success: false,
        errors: [{ field: "salePrice", message: validation.message }] as ProductError[],
      };
    }

    return {
      success: true,
      normalizedPrice: validation.normalized,
    };
  }
}

export const validateProductService = new ValidateProductService();
