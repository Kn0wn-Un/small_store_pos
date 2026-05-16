import type { Role } from "@/constants/roles";
import { createClient } from "@/supabase/server";

export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const normalizedRole = (profile?.role ?? "customer").toLowerCase();
  const role: Role =
    normalizedRole === "admin" || normalizedRole === "cashier" || normalizedRole === "customer"
      ? normalizedRole
      : "customer";

  return {
    id: user.id,
    email: user.email ?? "",
    role,
  };
}
