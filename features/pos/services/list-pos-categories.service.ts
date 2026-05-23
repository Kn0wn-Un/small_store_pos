import type { ActionResult } from "@/types/action-result";
import { posCategoriesRepository } from "../repositories/pos-categories.repository";
import type { PosCategory } from "../types/pos.types";

export class ListPosCategoriesService {
  async execute(): Promise<ActionResult<{ categories: PosCategory[] }>> {
    const categories = await posCategoriesRepository.listActive();
    return {
      success: true,
      message: "Categories loaded.",
      data: { categories },
    };
  }
}

export const listPosCategoriesService = new ListPosCategoriesService();
