import { createClient } from "@/supabase/server";
import { toMoneyString } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

function dayKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function monthKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export class AnalyticsRepository {
  async getDailySales(from: Date, to: Date) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales_logs")
      .select("created_at, total_amount, tax_amount, discount_amount")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    throwOnSupabaseError(error);

    const grouped = new Map<string, { totalSales: number; totalTax: number; totalDiscount: number }>();

    for (const row of data ?? []) {
      const key = dayKey(row.created_at);
      const current = grouped.get(key) ?? { totalSales: 0, totalTax: 0, totalDiscount: 0 };
      current.totalSales += Number(row.total_amount);
      current.totalTax += Number(row.tax_amount);
      current.totalDiscount += Number(row.discount_amount);
      grouped.set(key, current);
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, totals]) => ({
        day,
        totalSales: toMoneyString(totals.totalSales),
        totalTax: toMoneyString(totals.totalTax),
        totalDiscount: toMoneyString(totals.totalDiscount),
      }));
  }

  async getMonthlySales(from: Date, to: Date) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales_logs")
      .select("created_at, total_amount")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    throwOnSupabaseError(error);

    const grouped = new Map<string, number>();

    for (const row of data ?? []) {
      const key = monthKey(row.created_at);
      grouped.set(key, (grouped.get(key) ?? 0) + Number(row.total_amount));
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, totalSales]) => ({
        month,
        totalSales: toMoneyString(totalSales),
      }));
  }

  async getTopProducts(limit = 10) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("order_items").select(
      `
        product_id,
        quantity,
        line_subtotal,
        products ( name )
      `,
    );

    throwOnSupabaseError(error);

    const grouped = new Map<string, { productName: string; quantitySold: number; revenue: number }>();

    for (const row of data ?? []) {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      const current = grouped.get(row.product_id) ?? {
        productName: product?.name ?? "Unknown",
        quantitySold: 0,
        revenue: 0,
      };
      current.quantitySold += row.quantity;
      current.revenue += Number(row.line_subtotal);
      grouped.set(row.product_id, current);
    }

    return [...grouped.entries()]
      .map(([productId, totals]) => ({
        productId,
        productName: totals.productName,
        quantitySold: totals.quantitySold,
        revenue: toMoneyString(totals.revenue),
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  }

  async getLowInventory(limit = 20) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("inventory").select(
      `
        product_id,
        stock_quantity,
        low_stock_threshold,
        products ( name )
      `,
    );

    throwOnSupabaseError(error);

    return (data ?? [])
      .filter((row) => row.stock_quantity <= row.low_stock_threshold)
      .sort((a, b) => a.stock_quantity - b.stock_quantity)
      .slice(0, limit)
      .map((row) => {
        const product = Array.isArray(row.products) ? row.products[0] : row.products;
        return {
          productId: row.product_id,
          productName: product?.name ?? "Unknown",
          stockQuantity: row.stock_quantity,
          lowStockThreshold: row.low_stock_threshold,
        };
      });
  }

  async getPosVsEcommerce(from: Date, to: Date) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, source, total_amount")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    throwOnSupabaseError(error);

    const grouped = new Map<string, { ordersCount: number; revenue: number }>();

    for (const row of data ?? []) {
      const current = grouped.get(row.source) ?? { ordersCount: 0, revenue: 0 };
      current.ordersCount += 1;
      current.revenue += Number(row.total_amount);
      grouped.set(row.source, current);
    }

    return [...grouped.entries()].map(([source, totals]) => ({
      source: source as "pos" | "ecommerce",
      ordersCount: totals.ordersCount,
      revenue: toMoneyString(totals.revenue),
    }));
  }
}

export const analyticsRepository = new AnalyticsRepository();
