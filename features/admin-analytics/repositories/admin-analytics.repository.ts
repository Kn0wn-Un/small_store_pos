import { createClient } from "@/supabase/server";
import { mapOrderRow, toMoneyString } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import { analyticsRepository } from "@/features/analytics/repositories/analytics.repository";
import { customerInitial } from "../utils/analytics-format";
import type {
  AnalyticsAlert,
  CategorySalesRow,
  PaymentBreakdownRow,
  RecentOrderRow,
} from "../types/analytics.types";

type PeriodTotals = {
  revenue: number;
  ordersCount: number;
  discounts: number;
  tax: number;
  productsSold: number;
  activeCustomers: number;
  refunds: number;
  inventoryValue: number;
};

export class AdminAnalyticsRepository {
  async getPeriodTotals(from: Date, to: Date): Promise<PeriodTotals> {
    const supabase = await createClient();

    const [salesRes, ordersRes, customersRes, refundsRes, inventoryRes] = await Promise.all([
      supabase
        .from("sales_logs")
        .select("total_amount, discount_amount, tax_amount")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString()),
      supabase
        .from("orders")
        .select("id, customer_id, status")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .is("deleted_at", null),
      supabase
        .from("orders")
        .select("customer_id")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .is("deleted_at", null)
        .not("customer_id", "is", null),
      supabase
        .from("payments")
        .select("id, amount")
        .in("status", ["refunded", "partially_refunded"])
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString()),
      supabase.from("inventory").select(
        `
          stock_quantity,
          products ( sale_price )
        `,
      ),
    ]);

    throwOnSupabaseError(salesRes.error);
    throwOnSupabaseError(ordersRes.error);
    throwOnSupabaseError(customersRes.error);
    throwOnSupabaseError(refundsRes.error);
    throwOnSupabaseError(inventoryRes.error);

    const orderIds = (ordersRes.data ?? []).map((row) => row.id);
    let productsSold = 0;
    if (orderIds.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity")
        .in("order_id", orderIds);
      throwOnSupabaseError(itemsError);
      productsSold = (itemsData ?? []).reduce((sum, row) => sum + row.quantity, 0);
    }

    const revenue = (salesRes.data ?? []).reduce((sum, row) => sum + Number(row.total_amount), 0);
    const discounts = (salesRes.data ?? []).reduce((sum, row) => sum + Number(row.discount_amount), 0);
    const tax = (salesRes.data ?? []).reduce((sum, row) => sum + Number(row.tax_amount), 0);

    const customerIds = new Set((customersRes.data ?? []).map((row) => row.customer_id).filter(Boolean));

    const refunds = (refundsRes.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

    let inventoryValue = 0;
    for (const row of inventoryRes.data ?? []) {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      inventoryValue += row.stock_quantity * Number(product?.sale_price ?? 0);
    }

    return {
      revenue,
      ordersCount: ordersRes.data?.length ?? 0,
      discounts,
      tax,
      productsSold,
      activeCustomers: customerIds.size,
      refunds,
      inventoryValue,
    };
  }

  async getPendingOrdersCount(): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "processing"])
      .is("deleted_at", null);

    throwOnSupabaseError(error);
    return count ?? 0;
  }

  async getPaymentBreakdown(from: Date, to: Date): Promise<PaymentBreakdownRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .select("method, amount, status, orders!inner(created_at, deleted_at)")
      .eq("status", "paid")
      .gte("orders.created_at", from.toISOString())
      .lte("orders.created_at", to.toISOString())
      .is("orders.deleted_at", null);

    throwOnSupabaseError(error);

    const grouped = new Map<string, { count: number; amount: number }>();
    for (const row of data ?? []) {
      const method = row.method ?? "unknown";
      const current = grouped.get(method) ?? { count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(row.amount);
      grouped.set(method, current);
    }

    return [...grouped.entries()].map(([method, totals]) => ({
      method: method.toUpperCase(),
      count: totals.count,
      amount: toMoneyString(totals.amount),
    }));
  }

  async getCategorySales(from: Date, to: Date): Promise<CategorySalesRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        quantity,
        line_subtotal,
        products (
          categories ( name )
        ),
        orders!inner ( created_at, deleted_at )
      `,
      )
      .gte("orders.created_at", from.toISOString())
      .lte("orders.created_at", to.toISOString())
      .is("orders.deleted_at", null);

    throwOnSupabaseError(error);

    const grouped = new Map<string, { revenue: number; quantitySold: number }>();

    for (const row of data ?? []) {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      const category = product?.categories
        ? Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories
        : null;
      const name = category?.name ?? "Uncategorized";
      const current = grouped.get(name) ?? { revenue: 0, quantitySold: 0 };
      current.revenue += Number(row.line_subtotal);
      current.quantitySold += row.quantity;
      grouped.set(name, current);
    }

    return [...grouped.entries()]
      .map(([categoryName, totals]) => ({
        categoryName,
        revenue: toMoneyString(totals.revenue),
        quantitySold: totals.quantitySold,
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  async getRecentOrders(limit = 8): Promise<RecentOrderRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        users ( email, role ),
        payments ( method, status )
      `,
      )
      .is("deleted_at", null)
      .order("placed_at", { ascending: false })
      .limit(limit);

    throwOnSupabaseError(error);

    return (data ?? []).map((row) => {
      const order = mapOrderRow(row);
      const user = Array.isArray(row.users) ? row.users[0] : row.users;
      const payments = Array.isArray(row.payments) ? row.payments : row.payments ? [row.payments] : [];
      const paidPayment = payments.find((p) => p.status === "paid") ?? payments[0];
      const email = user?.email ?? "Walk-in";
      const displayName = email.split("@")[0] ?? "Customer";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: displayName,
        customerInitial: customerInitial(displayName),
        placedAt: order.placedAt.toISOString(),
        totalAmount: order.totalAmount,
        paymentMethod: (paidPayment?.method ?? "cash").toUpperCase(),
        status: order.status,
        paymentStatus: order.paymentStatus,
      };
    });
  }

  async getAlerts(): Promise<AnalyticsAlert[]> {
    const supabase = await createClient();
    const alerts: AnalyticsAlert[] = [];

    const lowStock = await analyticsRepository.getLowInventory(5);
    for (const item of lowStock) {
      alerts.push({
        id: `low-${item.productId}`,
        type: item.stockQuantity <= 0 ? "out_of_stock" : "low_stock",
        title: item.stockQuantity <= 0 ? "Out of stock" : "Low stock",
        description: `${item.productName} — ${item.stockQuantity} units left`,
        severity: item.stockQuantity <= 0 ? "error" : "warning",
      });
    }

    const { data: failedPayments, error: payError } = await supabase
      .from("payments")
      .select("id, amount, orders ( order_number )")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(5);

    throwOnSupabaseError(payError);

    for (const row of failedPayments ?? []) {
      const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
      alerts.push({
        id: `pay-${row.id}`,
        type: "payment_failed",
        title: "Payment failed",
        description: `Order ${order?.order_number ?? "—"} · ${toMoneyString(row.amount)}`,
        severity: "error",
      });
    }

    const { data: pendingOrders, error: ordError } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("status", "pending")
      .is("deleted_at", null)
      .limit(5);

    throwOnSupabaseError(ordError);

    for (const row of pendingOrders ?? []) {
      alerts.push({
        id: `ord-${row.id}`,
        type: "order_failed",
        title: "Pending order",
        description: `Order ${row.order_number} awaiting processing`,
        severity: "info",
      });
    }

    const { data: refunds, error: refundError } = await supabase
      .from("payments")
      .select("id, amount")
      .in("status", ["refunded", "partially_refunded"])
      .order("updated_at", { ascending: false })
      .limit(3);

    throwOnSupabaseError(refundError);

    for (const row of refunds ?? []) {
      alerts.push({
        id: `ref-${row.id}`,
        type: "refund",
        title: "Refund processed",
        description: `Refund amount ${toMoneyString(row.amount)}`,
        severity: "info",
      });
    }

    return alerts.slice(0, 12);
  }

  async getCoreAnalytics(from: Date, to: Date) {
    const [dailySales, monthlySales, topProducts, lowInventory, sourceSplit] = await Promise.all([
      analyticsRepository.getDailySales(from, to),
      analyticsRepository.getMonthlySales(from, to),
      analyticsRepository.getTopProducts(8),
      analyticsRepository.getLowInventory(10),
      analyticsRepository.getPosVsEcommerce(from, to),
    ]);

    return { dailySales, monthlySales, topProducts, lowInventory, sourceSplit };
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();
