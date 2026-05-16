import type { Role } from "@/constants/roles";
import { createClient } from "@/supabase/server";

export async function getActiveUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    role: data.role as Role,
    isActive: data.is_active,
  };
}
