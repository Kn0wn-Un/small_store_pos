import type { ActionResult } from "@/types/action-result";
import { formatInr } from "../utils/analytics-format";
import { getPreviousPeriod, percentChange, trendDirection } from "../utils/analytics-date";
import { analyticsFiltersSchema } from "../schemas/analytics-filters.schema";
import { adminAnalyticsRepository } from "../repositories/admin-analytics.repository";
import type { AdminAnalyticsDashboard, AnalyticsKpi } from "../types/analytics.types";

function buildKpi(
  key: string,
  label: string,
  current: number,
  previous: number,
  format: AnalyticsKpi["format"],
): AnalyticsKpi {
  const change = percentChange(current, previous);
  const value =
    format === "currency"
      ? formatInr(current)
      : format === "percent"
        ? `${current.toFixed(1)}%`
        : current.toLocaleString("en-IN");

  return {
    key,
    label,
    value,
    numericValue: current,
    trendPercent: change,
    trendDirection: trendDirection(change),
    format,
  };
}

export class AdminAnalyticsService {
  async getDashboard(from: Date, to: Date): Promise<AdminAnalyticsDashboard> {
    const previous = getPreviousPeriod(from, to);

    const [
      currentTotals,
      previousTotals,
      core,
      paymentBreakdownResult,
      categorySalesResult,
      recentOrders,
      alerts,
      pendingOrdersCount,
    ] = await Promise.all([
      adminAnalyticsRepository.getPeriodTotals(from, to),
      adminAnalyticsRepository.getPeriodTotals(previous.from, previous.to),
      adminAnalyticsRepository.getCoreAnalytics(from, to),
      adminAnalyticsRepository.getPaymentBreakdown(from, to).catch(() => []),
      adminAnalyticsRepository.getCategorySales(from, to).catch(() => []),
      adminAnalyticsRepository.getRecentOrders(8),
      adminAnalyticsRepository.getAlerts(),
      adminAnalyticsRepository.getPendingOrdersCount(),
    ]);

    const paymentBreakdown = paymentBreakdownResult;
    const categorySales =
      categorySalesResult.length > 0
        ? categorySalesResult
        : core.topProducts.map((p) => ({
            categoryName: p.productName,
            revenue: p.revenue,
            quantitySold: p.quantitySold,
          }));

    const avgOrderValue =
      currentTotals.ordersCount > 0 ? currentTotals.revenue / currentTotals.ordersCount : 0;
    const prevAvgOrderValue =
      previousTotals.ordersCount > 0 ? previousTotals.revenue / previousTotals.ordersCount : 0;

    const netProfit = currentTotals.revenue - currentTotals.discounts;
    const prevNetProfit = previousTotals.revenue - previousTotals.discounts;

    const kpis: AnalyticsKpi[] = [
      buildKpi("revenue", "Total Revenue", currentTotals.revenue, previousTotals.revenue, "currency"),
      buildKpi("orders", "Total Orders", currentTotals.ordersCount, previousTotals.ordersCount, "number"),
      buildKpi("netProfit", "Net Profit", netProfit, prevNetProfit, "currency"),
      buildKpi("aov", "Avg Order Value", avgOrderValue, prevAvgOrderValue, "currency"),
      buildKpi(
        "inventoryValue",
        "Inventory Value",
        currentTotals.inventoryValue,
        previousTotals.inventoryValue,
        "currency",
      ),
      buildKpi(
        "productsSold",
        "Products Sold",
        currentTotals.productsSold,
        previousTotals.productsSold,
        "number",
      ),
      buildKpi(
        "customers",
        "Active Customers",
        currentTotals.activeCustomers,
        previousTotals.activeCustomers,
        "number",
      ),
      buildKpi("refunds", "Refunds", currentTotals.refunds, previousTotals.refunds, "currency"),
    ];

    return {
      kpis,
      dailySales: core.dailySales,
      monthlySales: core.monthlySales,
      topProducts: core.topProducts,
      lowInventory: core.lowInventory,
      sourceSplit: core.sourceSplit,
      paymentBreakdown,
      categorySales,
      recentOrders,
      alerts,
      pendingOrdersCount,
    };
  }

  async execute(payload: unknown): Promise<ActionResult<AdminAnalyticsDashboard>> {
    const parsed = analyticsFiltersSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid analytics filters.",
        data: null,
        errors: [{ field: "filters", message: "Invalid date range." }],
      };
    }

    const data = await this.getDashboard(new Date(parsed.data.from), new Date(parsed.data.to));
    return {
      success: true,
      message: "Analytics loaded.",
      data,
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
