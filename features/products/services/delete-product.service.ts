import { z } from "zod";
import { DeleteProductRepository } from "../repositories/delete-product.repository";
import { GetProductRepository } from "../repositories/get-product.repository";
import type { ProductMutationActor, ProductResponse } from "../types/product.types";

const deleteProductSchema = z.object({
  id: z.string().uuid("Invalid product id."),
});

const getProductRepository = new GetProductRepository();
const deleteProductRepository = new DeleteProductRepository();

export class DeleteProductService {
  async execute(payload: unknown, actor: ProductMutationActor): Promise<ProductResponse<{ id: string }>> {
    void actor;
    const parsed = deleteProductSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid delete payload.",
        data: null,
        errors: [{ field: "id", message: "Invalid product id." }],
      };
    }

    const existing = await getProductRepository.getById(parsed.data.id);
    if (!existing) {
      return {
        success: false,
        message: "Product not found.",
        data: null,
        errors: [{ field: "id", message: "Product does not exist.", code: "NOT_FOUND" }],
      };
    }

    const deleted = await deleteProductRepository.softDeleteById(parsed.data.id);
    if (!deleted) {
      return {
        success: false,
        message: "Unable to delete product.",
        data: null,
        errors: [{ field: "general", message: "Delete failed.", code: "DELETE_FAILED" }],
      };
    }

    return {
      success: true,
      message: "Product deleted successfully.",
      data: { id: deleted.id },
    };
  }
}

export const deleteProductService = new DeleteProductService();
