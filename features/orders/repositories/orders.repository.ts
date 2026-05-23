import { createClient } from "@/supabase/server";
import { mapInvoiceRow, mapOrderItemRow, mapOrderRow, mapPaymentRow } from "@/lib/supabase/mappers";
import { callCreateOrderRpc } from "@/lib/supabase/rpc";
import type { CreateOrderAtomicParams } from "@/lib/supabase/rpc-types";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class OrdersRepository {
  async createOrderAtomic(params: CreateOrderAtomicParams) {
    const result = await callCreateOrderRpc(params);

    return {
      order: mapOrderRow(result.order),
      payment: mapPaymentRow(result.payment),
      invoice: mapInvoiceRow(result.invoice),
    };
  }

  async cancelOrder(orderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapOrderRow(data) : null;
  }

  async updateOrderStatus(
    orderId: string,
    status: "pending" | "paid" | "processing" | "delivered" | "cancelled" | "refunded",
  ) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapOrderRow(data) : null;
  }

  async getOrderById(orderId: string) {
    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(orderError);
    if (!order) {
      return null;
    }

    const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    throwOnSupabaseError(itemsError);

    return {
      order: mapOrderRow(order),
      items: (items ?? []).map(mapOrderItemRow),
    };
  }

  async listOrders(filters: {
    page: number;
    pageSize: number;
    search?: string;
    cashierUserId?: string;
  }) {
    const supabase = await createClient();
    const offset = (filters.page - 1) * filters.pageSize;

    let query = supabase.from("orders").select("*", { count: "exact" }).is("deleted_at", null);

    if (filters.cashierUserId) {
      query = query.eq("cashier_user_id", filters.cashierUserId);
    }

    if (filters.search) {
      query = query.ilike("order_number", `%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + filters.pageSize - 1);

    throwOnSupabaseError(error);

    return {
      rows: (data ?? []).map(mapOrderRow),
      total: count ?? 0,
    };
  }
}
