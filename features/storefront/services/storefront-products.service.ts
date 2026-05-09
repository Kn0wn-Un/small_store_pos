import type { ActionResult } from "@/types/action-result";
import type { StorefrontProduct } from "@/types/storefront/product";
import { storefrontProductsRepository } from "../repositories/storefront-products.repository";

export class StorefrontProductsService {
  async getFeaturedProducts(limit = 6): Promise<ActionResult<StorefrontProduct[]>> {
    const items = await storefrontProductsRepository.getFeaturedProducts(limit);
    return {
      success: true,
      message: "Featured products fetched successfully.",
      data: items.map((item) => ({
        ...item,
        stockQuantity: item.stockQuantity ?? 0,
        lowStockThreshold: item.lowStockThreshold ?? 5,
      })),
    };
  }

  async getProductById(productId: string): Promise<ActionResult<StorefrontProduct>> {
    const item = await storefrontProductsRepository.getProductById(productId);
    if (!item) {
      return {
        success: false,
        message: "Product not found.",
        data: null,
        errors: [{ field: "productId", message: "No product found." }],
      };
    }

    return {
      success: true,
      message: "Product fetched successfully.",
      data: {
        ...item,
        stockQuantity: item.stockQuantity ?? 0,
        lowStockThreshold: item.lowStockThreshold ?? 5,
      },
    };
  }
}

export const storefrontProductsService = new StorefrontProductsService();
