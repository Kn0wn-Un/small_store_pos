import type { ActionResult } from "@/types/action-result";
import { createPaymentSchema, updatePaymentStatusSchema } from "../schemas/payment.schema";
import { paymentsRepository } from "../repositories/payments.repository";

export class PaymentsService {
  async createPayment(payload: unknown): Promise<ActionResult<{ paymentId: string }>> {
    const parsed = createPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid payment payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const duplicate = await paymentsRepository.getPaymentByOrderOrTxRef({
      orderId: parsed.data.orderId,
      transactionId: parsed.data.transactionId,
    });

    if (duplicate && parsed.data.transactionId && duplicate.transactionId === parsed.data.transactionId) {
      return {
        success: true,
        message: "Payment already processed.",
        data: { paymentId: duplicate.id },
      };
    }

    return {
      success: false,
      message: "Payment creation outside transaction is not allowed.",
      data: null,
      errors: [{ field: "payment", message: "Use transactional order workflow." }],
    };
  }

  async updatePaymentStatus(payload: unknown): Promise<ActionResult<{ paymentId: string }>> {
    const parsed = updatePaymentStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, message: "Invalid payment status payload.", data: null, errors: [{ field: "payload", message: "Invalid payload." }] };
    }

    const updated = await paymentsRepository.updatePaymentStatus(parsed.data);
    if (!updated) {
      return { success: false, message: "Payment not found.", data: null, errors: [{ field: "paymentId", message: "Payment does not exist." }] };
    }

    return {
      success: true,
      message: "Payment status updated.",
      data: { paymentId: updated.id },
    };
  }

  async verifyPayment(payload: { paymentId: string }) {
    return this.updatePaymentStatus({ paymentId: payload.paymentId, status: "paid" });
  }

  async markPaymentFailed(payload: { paymentId: string }) {
    return this.updatePaymentStatus({ paymentId: payload.paymentId, status: "failed" });
  }
}

export const paymentsService = new PaymentsService();
