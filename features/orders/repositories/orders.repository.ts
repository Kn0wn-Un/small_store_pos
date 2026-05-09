import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { inventory } from "@/db/schema/inventory";
import { orderItems, orders } from "@/db/schema/commerce";

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
      items: Array<{ productId: string; quantity: number; unitPriceSnapshot: string; lineSubtotal: string }>;
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
      await tx
        .update(inventory)
        .set({
          stockQuantity: sql`${inventory.stockQuantity} - ${update.quantity}`,
        })
        .where(and(eq(inventory.productId, update.productId), sql`${inventory.stockQuantity} >= ${update.quantity}`));
    }
  }

  async withTransaction<T>(callback: (tx: Transaction) => Promise<T>) {
    return db.transaction(callback);
  }
}
