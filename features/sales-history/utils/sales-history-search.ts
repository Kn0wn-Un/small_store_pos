import { createClient } from "@/supabase/server";
import { throwOnSupabaseError } from "@/lib/supabase/query";

/** Escape user input for safe use inside PostgREST ilike patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Resolves order IDs matching a search term across order number, invoice, payment ref, and customer.
 * Returns [] when nothing matches, null when search is empty (no ID filter).
 */
export async function resolveSearchOrderIds(search: string | undefined): Promise<string[] | null> {
  const trimmed = search?.trim();
  if (!trimmed) return null;

  const pattern = `%${escapeIlikePattern(trimmed)}%`;
  const supabase = await createClient();

  const [byOrderNumber, byInvoice, byPayment, byCustomerEmail, byCustomerName] = await Promise.all([
    supabase.from("orders").select("id").is("deleted_at", null).ilike("order_number", pattern),
    supabase.from("invoices").select("order_id").ilike("invoice_number", pattern),
    supabase.from("payments").select("order_id").ilike("transaction_id", pattern),
    supabase.from("users").select("id").ilike("email", pattern),
    supabase.from("users").select("id").ilike("full_name", pattern),
  ]);

  throwOnSupabaseError(byOrderNumber.error);
  throwOnSupabaseError(byInvoice.error);
  throwOnSupabaseError(byPayment.error);
  throwOnSupabaseError(byCustomerEmail.error);
  throwOnSupabaseError(byCustomerName.error);

  const customerIds = new Set([
    ...(byCustomerEmail.data ?? []).map((row) => row.id),
    ...(byCustomerName.data ?? []).map((row) => row.id),
  ]);
  let byCustomerOrders: { id: string }[] = [];

  if (customerIds.size > 0) {
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .is("deleted_at", null)
      .in("customer_id", [...customerIds]);
    throwOnSupabaseError(error);
    byCustomerOrders = data ?? [];
  }

  const ids = new Set<string>();
  for (const row of byOrderNumber.data ?? []) ids.add(row.id);
  for (const row of byInvoice.data ?? []) {
    if (row.order_id) ids.add(row.order_id);
  }
  for (const row of byPayment.data ?? []) ids.add(row.order_id);
  for (const row of byCustomerOrders) ids.add(row.id);

  return [...ids];
}
