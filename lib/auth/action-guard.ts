import { and, eq } from "drizzle-orm";
import type { Role } from "@/constants/roles";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/supabase/server";
import type { ActionResult, AuthenticatedActor } from "@/types/action-result";
import { hasRole } from "./rbac";

export async function authorizeActionRole(allowedRoles: readonly Role[]): Promise<ActionResult<AuthenticatedActor>> {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData.user) {
    return {
      success: false,
      message: "Unauthorized.",
      data: null,
      errors: [{ field: "auth", message: "Sign in required.", code: "UNAUTHORIZED" }],
    };
  }

  const [profile] = await db
    .select({
      id: users.id,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, authData.user.id), eq(users.isActive, true)))
    .limit(1);

  if (!profile?.isActive || !hasRole(profile.role, allowedRoles)) {
    return {
      success: false,
      message: "Forbidden.",
      data: null,
      errors: [{ field: "auth", message: "Insufficient role.", code: "FORBIDDEN" }],
    };
  }

  return {
    success: true,
    message: "Authorized.",
    data: {
      userId: profile.id,
      role: profile.role,
    },
  };
}
