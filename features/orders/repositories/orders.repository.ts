import { and, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventory } from "@/db/schema/inventory";
import { orderItems, orders, payments, salesLogs } from "@/db/schema/commerce";
import { invoices } from "@/db/schema/commerce";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class OrdersRepository {
  async createOrderTx(
    tx: Transaction,
    payload: {
      orderNumber: string;
      customerId: string;
      source: "pos" | "ecommerce";
      subtotalAmount: string;
      taxAmount: string;
      discountAmount: string;
      totalAmount: string;
      items: Array<{ productId: string; quantity: number; unitPriceSnapshot: string; taxPercentageSnapshot: string; lineSubtotal: string }>;
    },
  ) {
    const [createdOrder] = await tx
      .insert(orders)
      .values({
        orderNumber: payload.orderNumber,
        customerId: payload.customerId,
        source: payload.source,
        subtotalAmount: payload.subtotalAmount,
        taxAmount: payload.taxAmount,
        discountAmount: payload.discountAmount,
        totalAmount: payload.totalAmount,
      })
      .returning();

    await tx.insert(orderItems).values(
      payload.items.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPriceSnapshot,
        taxPercentageSnapshot: item.taxPercentageSnapshot,
        lineSubtotal: item.lineSubtotal,
      })),
    );

    return createdOrder;
  }

  async lockAndGetInventoryRowsTx(tx: Transaction, productIds: string[]) {
    return tx
      .select()
      .from(inventory)
      .where(inArray(inventory.productId, productIds))
      .for("update");
  }

  async decrementInventoryTx(tx: Transaction, updates: Array<{ productId: string; quantity: number }>) {
    for (const update of updates) {
      const [updated] = await tx
        .update(inventory)
        .set({
          stockQuantity: sql`${inventory.stockQuantity} - ${update.quantity}`,
        })
        .where(and(eq(inventory.productId, update.productId), sql`${inventory.stockQuantity} >= ${update.quantity}`))
        .returning();

      if (!updated) {
        throw new Error(`Inventory decrement failed for ${update.productId}`);
      }
    }
  }

  async createPaymentTx(
    tx: Transaction,
    payload: {
      orderId: string;
      provider: "cash" | "upi" | "card";
      method: "cash" | "upi" | "card" | "bank_transfer";
      amount: string;
      status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
      transactionId?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const [created] = await tx.insert(payments).values(payload).returning();
    return created;
  }

  async createInvoiceTx(tx: Transaction, payload: { invoiceNumber: string; orderId: string; pdfUrl?: string }) {
    const [created] = await tx.insert(invoices).values(payload).returning();
    return created;
  }

  async createSalesLogTx(
    tx: Transaction,
    payload: {
      source: "pos" | "ecommerce";
      orderId: string;
      totalAmount: string;
      taxAmount: string;
      discountAmount: string;
    },
  ) {
    const [created] = await tx.insert(salesLogs).values(payload).returning();
    return created;
  }

  async cancelOrder(orderId: string) {
    const [updated] = await db
      .update(orders)
      .set({
        status: "cancelled",
      })
      .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
      .returning();
    return updated ?? null;
  }

  async updateOrderStatus(orderId: string, status: "pending" | "paid" | "processing" | "delivered" | "cancelled" | "refunded") {
    const [updated] = await db
      .update(orders)
      .set({
        status,
      })
      .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
      .returning();
    return updated ?? null;
  }

  async getOrderById(orderId: string) {
    const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), isNull(orders.deletedAt))).limit(1);
    if (!order) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    return { order, items };
  }

  async listOrders(filters: { page: number; pageSize: number; search?: string }) {
    const conditions = [isNull(orders.deletedAt)];
    if (filters.search) {
      conditions.push(ilike(orders.orderNumber, `%${filters.search}%`));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(...conditions));

    const rows = await db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize);

    return {
      rows,
      total: countResult?.count ?? 0,
    };
  }

  async withTransaction<T>(callback: (tx: Transaction) => Promise<T>) {
    return db.transaction(callback);
  }
}
