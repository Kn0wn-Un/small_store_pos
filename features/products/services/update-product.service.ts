import { GetProductRepository } from "../repositories/get-product.repository";
import { UpdateProductRepository } from "../repositories/update-product.repository";
import { updateProductSchema } from "../schemas/update-product.schema";
import type { ProductMutationActor, ProductResponse } from "../types/product.types";
import { formatPrice } from "../utils/format-price";
import { validateProductService } from "./validate-product.service";

const getProductRepository = new GetProductRepository();
const updateProductRepository = new UpdateProductRepository();

export class UpdateProductService {
  async execute(payload: unknown, actor: ProductMutationActor): Promise<ProductResponse<{ id: string }>> {
    void actor;
    const parsed = updateProductSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid update payload.",
        data: null,
        errors: Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({ field, message })),
        ),
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

    if (parsed.data.categoryId) {
      const categoryExists = await getProductRepository.categoryExists(parsed.data.categoryId);
      if (!categoryExists) {
        return {
          success: false,
          message: "Category does not exist.",
          data: null,
          errors: [{ field: "categoryId", message: "Please choose a valid category.", code: "CATEGORY_NOT_FOUND" }],
        };
      }
    }

    let normalizedName: string | undefined;
    if (parsed.data.name !== undefined) {
      const nameResult = validateProductService.normalizeName(parsed.data.name);
      if (!nameResult.success || !nameResult.normalizedName) {
        return { success: false, message: "Invalid product name.", data: null, errors: nameResult.errors };
      }
      normalizedName = nameResult.normalizedName;

      const duplicate = await getProductRepository.findByNormalizedName(normalizedName, {
        excludeProductId: parsed.data.id,
      });

      if (duplicate) {
        return {
          success: false,
          message: "Product name already exists.",
          data: null,
          errors: [{ field: "name", message: "Use a unique product name.", code: "DUPLICATE_NAME" }],
        };
      }
    }

    if (parsed.data.salePrice !== undefined) {
      const priceResult = validateProductService.normalizePrice(parsed.data.salePrice);
      if (!priceResult.success || !priceResult.normalizedPrice) {
        return { success: false, message: "Invalid product price.", data: null, errors: priceResult.errors };
      }
    }

    const updated = await updateProductRepository.updateProductById(parsed.data.id, {
      name: normalizedName,
      description: parsed.data.description === undefined ? undefined : (parsed.data.description ?? null),
      categoryId: parsed.data.categoryId,
      imageUrl: parsed.data.imageUrl === undefined ? undefined : (parsed.data.imageUrl ?? null),
      salePrice: parsed.data.salePrice === undefined ? undefined : formatPrice(parsed.data.salePrice),
      isActive: parsed.data.isActive,
    });

    if (!updated) {
      return {
        success: false,
        message: "Unable to update product.",
        data: null,
        errors: [{ field: "general", message: "Update failed.", code: "UPDATE_FAILED" }],
      };
    }

    return {
      success: true,
      message: "Product updated successfully.",
      data: { id: updated.id },
    };
  }
}

export const updateProductService = new UpdateProductService();
