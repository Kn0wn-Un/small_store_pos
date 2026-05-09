import { randomUUID } from "node:crypto";
import { createOrderSchema, type CreateOrderInput } from "../schemas/create-order.schema";
import { OrdersRepository } from "../repositories/orders.repository";

const repository = new OrdersRepository();
type InventoryRow = Awaited<ReturnType<OrdersRepository["lockAndGetInventoryRowsTx"]>>[number];

export class OrdersService {
  async createOrder(payload: unknown) {
    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid order payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    return repository.withTransaction(async (tx) => {
      const inventoryRows = await repository.lockAndGetInventoryRowsTx(
        tx,
        data.items.map((item) => item.productId),
      );

      for (const item of data.items) {
        const row = inventoryRows.find((r: InventoryRow) => r.productId === item.productId);
        if (!row || row.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }

      await repository.decrementInventoryTx(
        tx,
        data.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );

      const created = await repository.createOrderTx(tx, {
        ...data,
        orderNumber: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
      } as CreateOrderInput & { orderNumber: string });

      return {
        success: true,
        message: "Order created successfully.",
        orderId: created.id,
      };
    });
  }
}

export const ordersService = new OrdersService();
