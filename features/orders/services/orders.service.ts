import { randomUUID } from "node:crypto";
import { createOrderSchema, type CreateOrderInput } from "../schemas/create-order.schema";
import { cancelOrderSchema, getOrderSchema, listOrdersSchema, updateOrderStatusSchema } from "../schemas/order-management.schema";
import { OrdersRepository } from "../repositories/orders.repository";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import { auditRepository } from "@/features/audit/repositories/audit.repository";

const repository = new OrdersRepository();
type InventoryRow = Awaited<ReturnType<OrdersRepository["lockAndGetInventoryRowsTx"]>>[number];

export class OrdersService {
  async createOrder(payload: unknown) {
    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid order payload.",
        data: null,
        errors: [{ field: "payload", message: "Invalid order payload." }],
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

      const createdOrder = await repository.createOrderTx(tx, {
        ...data,
        orderNumber: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
      } as CreateOrderInput & { orderNumber: string });

      const createdPayment = await repository.createPaymentTx(tx, {
        orderId: createdOrder.id,
        provider: data.paymentProvider,
        method: data.paymentMethod,
        amount: data.totalAmount,
        status: data.paymentStatus,
        transactionId: data.transactionId,
      });

      const createdInvoice = await repository.createInvoiceTx(tx, {
        orderId: createdOrder.id,
        invoiceNumber: invoicesService.buildInvoiceNumber(),
      });

      await repository.createSalesLogTx(tx, {
        orderId: createdOrder.id,
        source: data.source,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
      });

      await auditRepository.createLogTx(tx, {
        entityName: "orders",
        entityId: createdOrder.id,
        action: "create",
        actorUserId: data.customerId,
        afterState: {
          orderId: createdOrder.id,
          paymentId: createdPayment.id,
          invoiceId: createdInvoice.id,
        },
      });

      return {
        success: true,
        message: "Order created successfully.",
        data: {
          orderId: createdOrder.id,
          paymentId: createdPayment.id,
          invoiceId: createdInvoice.id,
        },
      };
    });
  }

  async cancelOrder(payload: unknown) {
    const parsed = cancelOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid cancel order payload.", data: null, errors: [{ field: "orderId", message: "Invalid order id." }] };
    }

    const cancelled = await repository.cancelOrder(parsed.data.orderId);
    if (!cancelled) {
      return { success: false, message: "Order not found.", data: null, errors: [{ field: "orderId", message: "Order not found." }] };
    }

    await auditRepository.createLog({
      entityName: "orders",
      entityId: cancelled.id,
      action: "status_change",
      afterState: { status: cancelled.status },
    });

    return {
      success: true,
      message: "Order cancelled successfully.",
      data: { orderId: cancelled.id },
    };
  }

  async getOrder(payload: unknown) {
    const parsed = getOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid get order payload.", data: null, errors: [{ field: "orderId", message: "Invalid order id." }] };
    }

    const data = await repository.getOrderById(parsed.data.orderId);
    if (!data) {
      return { success: false, message: "Order not found.", data: null, errors: [{ field: "orderId", message: "Order not found." }] };
    }

    return { success: true, message: "Order fetched successfully.", data };
  }

  async listOrders(payload: unknown) {
    const parsed = listOrdersSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return { success: false, message: "Invalid list orders payload.", data: null, errors: [{ field: "payload", message: "Invalid filters." }] };
    }

    const { rows, total } = await repository.listOrders(parsed.data);
    return {
      success: true,
      message: "Orders fetched successfully.",
      data: {
        items: rows,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsed.data.pageSize)),
      },
    };
  }

  async updateOrderStatus(payload: unknown) {
    const parsed = updateOrderStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid status update payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const updated = await repository.updateOrderStatus(parsed.data.orderId, parsed.data.status);
    if (!updated) {
      return { success: false, message: "Order not found.", data: null, errors: [{ field: "orderId", message: "Order not found." }] };
    }

    await auditRepository.createLog({
      entityName: "orders",
      entityId: updated.id,
      action: "status_change",
      afterState: { status: updated.status },
    });

    return {
      success: true,
      message: "Order status updated.",
      data: { orderId: updated.id, status: updated.status },
    };
  }
}

export const ordersService = new OrdersService();
