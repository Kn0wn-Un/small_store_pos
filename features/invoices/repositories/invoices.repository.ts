import { createClient } from "@/supabase/server";
import { mapInvoiceRow } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class InvoicesRepository {
  async getByOrderId(orderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("*").eq("order_id", orderId).maybeSingle();
    throwOnSupabaseError(error);
    return data ? mapInvoiceRow(data) : null;
  }

  async getByInvoiceNumber(invoiceNumber: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("*").eq("invoice_number", invoiceNumber).maybeSingle();
    throwOnSupabaseError(error);
    return data ? mapInvoiceRow(data) : null;
  }
}

export const invoicesRepository = new InvoicesRepository();
