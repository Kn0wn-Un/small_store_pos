import type { Role } from "@/constants/roles";

export function canAccessOrder(role: Role, actorUserId: string, orderCustomerId: string) {
  if (role === "admin" || role === "cashier") return true;
  return actorUserId === orderCustomerId;
}

export function canManageInventory(role: Role) {
  return role === "admin" || role === "cashier";
}
