import type { ActionResult } from "@/types/action-result";
import { analyticsRepository } from "../repositories/analytics.repository";

export class AnalyticsService {
  async dashboard(from: Date, to: Date): Promise<ActionResult<Record<string, unknown>>> {
    const [dailySales, monthlySales, topProducts, lowInventory, sourceSplit] = await Promise.all([
      analyticsRepository.getDailySales(from, to),
      analyticsRepository.getMonthlySales(from, to),
      analyticsRepository.getTopProducts(),
      analyticsRepository.getLowInventory(),
      analyticsRepository.getPosVsEcommerce(from, to),
    ]);

    return {
      success: true,
      message: "Analytics fetched successfully.",
      data: {
        dailySales,
        monthlySales,
        topProducts,
        lowInventory,
        sourceSplit,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
