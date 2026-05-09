import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventory } from "@/db/schema/inventory";
import { orderItems, orders, salesLogs } from "@/db/schema/commerce";
import { products } from "@/db/schema/catalog";

export class AnalyticsRepository {
  async getDailySales(from: Date, to: Date) {
    return db
      .select({
        day: sql<string>`date_trunc('day', ${salesLogs.createdAt})::date::text`,
        totalSales: sql<string>`coalesce(sum(${salesLogs.totalAmount}), 0)::text`,
        totalTax: sql<string>`coalesce(sum(${salesLogs.taxAmount}), 0)::text`,
        totalDiscount: sql<string>`coalesce(sum(${salesLogs.discountAmount}), 0)::text`,
      })
      .from(salesLogs)
      .where(sql`${salesLogs.createdAt} between ${from} and ${to}`)
      .groupBy(sql`date_trunc('day', ${salesLogs.createdAt})`)
      .orderBy(sql`date_trunc('day', ${salesLogs.createdAt})`);
  }

  async getMonthlySales(from: Date, to: Date) {
    return db
      .select({
        month: sql<string>`date_trunc('month', ${salesLogs.createdAt})::date::text`,
        totalSales: sql<string>`coalesce(sum(${salesLogs.totalAmount}), 0)::text`,
      })
      .from(salesLogs)
      .where(sql`${salesLogs.createdAt} between ${from} and ${to}`)
      .groupBy(sql`date_trunc('month', ${salesLogs.createdAt})`)
      .orderBy(sql`date_trunc('month', ${salesLogs.createdAt})`);
  }

  async getTopProducts(limit = 10) {
    return db
      .select({
        productId: orderItems.productId,
        productName: products.name,
        quantitySold: sql<number>`sum(${orderItems.quantity})::int`,
        revenue: sql<string>`sum(${orderItems.lineSubtotal})::text`,
      })
      .from(orderItems)
      .leftJoin(products, eq(products.id, orderItems.productId))
      .groupBy(orderItems.productId, products.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(limit);
  }

  async getLowInventory(limit = 20) {
    return db
      .select({
        productId: inventory.productId,
        productName: products.name,
        stockQuantity: inventory.stockQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
      })
      .from(inventory)
      .leftJoin(products, eq(products.id, inventory.productId))
      .where(lte(inventory.stockQuantity, inventory.lowStockThreshold))
      .orderBy(inventory.stockQuantity)
      .limit(limit);
  }

  async getPosVsEcommerce(from: Date, to: Date) {
    return db
      .select({
        source: orders.source,
        ordersCount: sql<number>`count(${orders.id})::int`,
        revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, from), lte(orders.createdAt, to)))
      .groupBy(orders.source);
  }
}

export const analyticsRepository = new AnalyticsRepository();
