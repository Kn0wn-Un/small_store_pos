import { createClient } from "@/supabase/server";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class CheckoutRepository {
  async validateAddressForUser(payload: { addressId: string; userId: string }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", payload.addressId)
      .eq("user_id", payload.userId)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(error);
    return Boolean(data);
  }
}

export const checkoutRepository = new CheckoutRepository();
