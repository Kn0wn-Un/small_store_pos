"use client";

import { useMemo } from "react";
import type { Role } from "@/constants/roles";
import { hasRole } from "@/lib/auth/rbac";

export function useRole(userRole: Role | null | undefined, allowed: readonly Role[]) {
  return useMemo(() => hasRole(userRole, allowed), [allowed, userRole]);
}
