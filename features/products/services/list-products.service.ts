import { ListProductsRepository } from "../repositories/list-products.repository";
import { productFiltersSchema } from "../schemas/product-filters.schema";
import type { ProductListData, ProductResponse } from "../types/product.types";

const listProductsRepository = new ListProductsRepository();

export class ListProductsService {
  async execute(payload: unknown): Promise<ProductResponse<ProductListData>> {
    const parsed = productFiltersSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid product filters.",
        data: null,
        errors: Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({ field, message })),
        ),
      };
    }

    const { rows, total } = await listProductsRepository.list(parsed.data);
    const totalPages = Math.max(1, Math.ceil(total / parsed.data.pageSize));

    return {
      success: true,
      message: "Products fetched successfully.",
      data: {
        items: rows,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
        totalPages,
      },
    };
  }
}

export const listProductsService = new ListProductsService();
