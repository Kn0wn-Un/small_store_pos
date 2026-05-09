import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import type { DbTransaction } from "@/lib/transaction";

export class PaymentsRepository {
  async createPaymentTx(
    tx: DbTransaction,
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

  async getPaymentByOrderOrTxRef(payload: { orderId: string; transactionId?: string }) {
    const conditions = [eq(payments.orderId, payload.orderId)];
    if (payload.transactionId) {
      conditions.push(eq(payments.transactionId, payload.transactionId));
    }
    const [row] = await db
      .select()
      .from(payments)
      .where(conditions.length > 1 ? or(...conditions) : conditions[0])
      .limit(1);
    return row ?? null;
  }

  async updatePaymentStatus(payload: { paymentId: string; status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded" }) {
    const [updated] = await db
      .update(payments)
      .set({
        status: payload.status,
        paidAt: payload.status === "paid" ? new Date() : null,
      })
      .where(and(eq(payments.id, payload.paymentId)))
      .returning();
    return updated ?? null;
  }
}

export const paymentsRepository = new PaymentsRepository();
