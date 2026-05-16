import type { Role } from "@/constants/roles";
import { DEFAULT_REDIRECT_BY_ROLE } from "@/constants/routes";

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export function resolvePostLoginRedirect(role: Role, requestedRedirect?: string | null): string {
  const defaultDestination = DEFAULT_REDIRECT_BY_ROLE[role];

  if (!requestedRedirect || !isSafeInternalPath(requestedRedirect)) {
    return defaultDestination;
  }

  if (requestedRedirect === "/admin" || requestedRedirect.startsWith("/admin/")) {
    return role === "admin" ? (requestedRedirect === "/admin" ? "/admin/analytics" : requestedRedirect) : defaultDestination;
  }

  if (requestedRedirect.startsWith("/pos")) {
    return role === "admin" || role === "cashier" ? requestedRedirect : defaultDestination;
  }

  return requestedRedirect;
}
