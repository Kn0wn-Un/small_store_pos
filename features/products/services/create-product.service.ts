import { createProductSchema } from "../schemas/create-product.schema";
import { CreateProductRepository } from "../repositories/create-product.repository";
import { GetProductRepository } from "../repositories/get-product.repository";
import { formatPrice } from "../utils/format-price";
import { validateProductService } from "./validate-product.service";
import type { ProductMutationActor, ProductResponse } from "../types/product.types";

const createProductRepository = new CreateProductRepository();
const getProductRepository = new GetProductRepository();

export class CreateProductService {
  async execute(payload: unknown, actor: ProductMutationActor): Promise<ProductResponse<{ id: string }>> {
    const parsed = createProductSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid product payload.",
        data: null,
        errors: Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({ field, message })),
        ),
      };
    }

    const nameResult = validateProductService.normalizeName(parsed.data.name);
    if (!nameResult.success || !nameResult.normalizedName) {
      return { success: false, message: "Invalid product name.", data: null, errors: nameResult.errors };
    }

    const priceResult = validateProductService.normalizePrice(parsed.data.salePrice);
    if (!priceResult.success || !priceResult.normalizedPrice) {
      return { success: false, message: "Invalid product price.", data: null, errors: priceResult.errors };
    }
    const normalizedName = nameResult.normalizedName;
    const normalizedPrice = priceResult.normalizedPrice;

    const duplicate = await getProductRepository.findByNormalizedName(normalizedName);
    if (duplicate) {
      return {
        success: false,
        message: "Product name already exists.",
        data: null,
        errors: [{ field: "name", message: "Use a unique product name.", code: "DUPLICATE_NAME" }],
      };
    }

    const categoryExists = await getProductRepository.categoryExists(parsed.data.categoryId);
    if (!categoryExists) {
      return {
        success: false,
        message: "Category does not exist.",
        data: null,
        errors: [{ field: "categoryId", message: "Please choose a valid category.", code: "CATEGORY_NOT_FOUND" }],
      };
    }

    try {
      const created = await createProductRepository.createProductWithInventory({
        categoryId: parsed.data.categoryId,
        name: normalizedName,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
        salePrice: formatPrice(normalizedPrice),
        isActive: parsed.data.isActive ?? true,
        actorUserId: actor.userId,
      });

      return {
        success: true,
        message: "Product created successfully.",
        data: { id: created.product.id },
      };
    } catch {
      return {
        success: false,
        message: "Unable to create product right now.",
        data: null,
        errors: [{ field: "general", message: "Product creation failed.", code: "CREATE_FAILED" }],
      };
    }
  }
}

export const createProductService = new CreateProductService();
