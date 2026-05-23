import type { ActionResult } from "@/types/action-result";
import { posProductFiltersSchema } from "../schemas/pos-product-filters.schema";
import { posProductsRepository } from "../repositories/pos-products.repository";
import type { PosProduct } from "../types/pos.types";

export class ListPosProductsService {
  async execute(payload: unknown): Promise<ActionResult<{ products: PosProduct[]; total: number }>> {
    const parsed = posProductFiltersSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid product filters.",
        data: null,
        errors: [{ field: "filters", message: "Invalid filters." }],
      };
    }

    const { products, total } = await posProductsRepository.list(parsed.data);
    return {
      success: true,
      message: "Products loaded.",
      data: { products, total },
    };
  }
}

export const listPosProductsService = new ListPosProductsService();
