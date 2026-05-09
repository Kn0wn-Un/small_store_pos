import { ROLES, type Role } from "@/constants/roles";

export const ROLE_ACCESS = {
  admin: [ROLES.ADMIN],
  cashier: [ROLES.ADMIN, ROLES.CASHIER],
  customer: [ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER],
} as const;

export function hasRole(userRole: Role | null | undefined, allowedRoles: readonly Role[]) {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function assertRole(userRole: Role | null | undefined, allowedRoles: readonly Role[]) {
  if (!hasRole(userRole, allowedRoles)) {
    throw new Error("Unauthorized");
  }
}
