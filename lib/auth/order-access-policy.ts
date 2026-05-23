import { ROLES, type Role } from "@/constants/roles";
import type { SalesHistoryMode } from "@/features/sales-history/types/sales-history.types";

export type OrderAccessActor = {
  userId: string;
  role: Role;
};

export type OrderAccessRecord = {
  customerId: string | null;
  cashierUserId: string | null;
};

export type OrderListScope = {
  /** When set, list/detail queries restrict to this cashier. */
  cashierUserId?: string;
  /** Admin-only filter by a specific cashier. */
  filterCashierId?: string;
};

/**
 * Whether the actor may view a single order.
 * Admin (non-cashier preview mode) sees all; cashiers only their attributed sales; customers own orders.
 */
export function canViewOrder(
  actor: OrderAccessActor,
  order: OrderAccessRecord,
  options?: { salesHistoryMode?: SalesHistoryMode },
): boolean {
  const previewAsCashier = options?.salesHistoryMode === "cashier";

  if (actor.role === ROLES.ADMIN && !previewAsCashier) {
    return true;
  }

  if (actor.role === ROLES.CASHIER || previewAsCashier) {
    return order.cashierUserId === actor.userId;
  }

  if (actor.role === ROLES.CUSTOMER) {
    return order.customerId === actor.userId;
  }

  return false;
}

/**
 * Resolves list/detail scope for order reads.
 */
export function resolveOrderListScope(
  actor: OrderAccessActor,
  options?: {
    salesHistoryMode?: SalesHistoryMode;
    filterCashierId?: string;
  },
): OrderListScope {
  const previewAsCashier = options?.salesHistoryMode === "cashier";
  const cashierOnly = actor.role === ROLES.CASHIER || previewAsCashier;

  if (cashierOnly) {
    return { cashierUserId: actor.userId };
  }

  if (actor.role === ROLES.ADMIN && options?.filterCashierId) {
    return { filterCashierId: options.filterCashierId };
  }

  return {};
}

export function assertCashierFilterAllowed(
  actor: OrderAccessActor,
  filterCashierId?: string,
): { allowed: true } | { allowed: false; message: string } {
  if (!filterCashierId) {
    return { allowed: true };
  }

  if (actor.role !== ROLES.ADMIN) {
    if (filterCashierId !== actor.userId) {
      return { allowed: false, message: "Cannot filter by another cashier." };
    }
  }

  return { allowed: true };
}
