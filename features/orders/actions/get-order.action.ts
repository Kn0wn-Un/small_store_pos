"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { ordersService } from "../services/orders.service";

export async function getOrderAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success || !auth.data) return auth;

  return ordersService.getOrder(payload, auth.data);
}
