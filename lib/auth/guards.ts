import { redirect } from "next/navigation";
import type { Role } from "@/constants/roles";
import { DEFAULT_REDIRECT_BY_ROLE } from "@/constants/routes";
import { hasRole } from "./rbac";
import { getServerSession } from "./session";

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(allowedRoles: readonly Role[]) {
  const session = await requireAuth();
  if (!hasRole(session.role, allowedRoles)) {
    redirect(DEFAULT_REDIRECT_BY_ROLE[session.role]);
  }
  return session;
}
