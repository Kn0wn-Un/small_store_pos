import { createClient } from "@/supabase/server";
import { mapPaymentRow } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class PaymentsRepository {
  async getPaymentByOrderOrTxRef(payload: { orderId: string; transactionId?: string }) {
    const supabase = await createClient();

    if (payload.transactionId) {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .or(`order_id.eq.${payload.orderId},transaction_id.eq.${payload.transactionId}`)
        .limit(1)
        .maybeSingle();

      throwOnSupabaseError(error);
      return data ? mapPaymentRow(data) : null;
    }

    const { data, error } = await supabase.from("payments").select("*").eq("order_id", payload.orderId).maybeSingle();
    throwOnSupabaseError(error);
    return data ? mapPaymentRow(data) : null;
  }

  async updatePaymentStatus(payload: {
    paymentId: string;
    status: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: payload.status,
        paid_at: payload.status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", payload.paymentId)
      .select("*")
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapPaymentRow(data) : null;
  }
}

export const paymentsRepository = new PaymentsRepository();
