import { randomUUID } from "node:crypto";
import { createOrderSchema } from "../schemas/create-order.schema";
import { cancelOrderSchema, getOrderSchema, listOrdersSchema, updateOrderStatusSchema } from "../schemas/order-management.schema";
import { OrdersRepository } from "../repositories/orders.repository";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import { auditRepository } from "@/features/audit/repositories/audit.repository";

const repository = new OrdersRepository();

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

    try {
      const created = await repository.createOrderAtomic({
        orderNumber: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
        customerId: data.customerId,
        source: data.source,
        subtotalAmount: data.subtotalAmount,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
        items: data.items,
        paymentProvider: data.paymentProvider,
        paymentMethod: data.paymentMethod,
        paymentAmount: data.totalAmount,
        paymentStatus: data.paymentStatus,
        transactionId: data.transactionId,
        invoiceNumber: invoicesService.buildInvoiceNumber(),
        actorUserId: data.customerId,
      });

      return {
        success: true,
        message: "Order created successfully.",
        data: {
          orderId: created.order.id,
          paymentId: created.payment.id,
          invoiceId: created.invoice.id,
        },
      };
    } catch {
      return {
        success: false,
        message: "Unable to create order right now.",
        data: null,
        errors: [{ field: "general", message: "Order creation failed." }],
      };
    }
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
