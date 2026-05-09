"use server";

import { storefrontProductsService } from "../services/storefront-products.service";

export async function getFeaturedProductsAction(limit = 6) {
  return storefrontProductsService.getFeaturedProducts(limit);
}

export async function getStorefrontProductByIdAction(productId: string) {
  return storefrontProductsService.getProductById(productId);
}
