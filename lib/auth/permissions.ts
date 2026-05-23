import type { Role } from "@/constants/roles";

/** @deprecated Use canViewOrder from order-access-policy.ts */
export function canAccessOrder(role: Role, actorUserId: string, orderCustomerId: string | null) {
  if (role === "admin") return true;
  return actorUserId === orderCustomerId;
}

export function canManageInventory(role: Role) {
  return role === "admin" || role === "cashier";
}
