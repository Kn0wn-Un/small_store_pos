"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { ordersService } from "../services/orders.service";

export async function cancelOrderAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return auth;

  const result = await ordersService.cancelOrder(payload);
  if (result.success) {
    revalidatePath("/admin/orders");
    revalidatePath("/pos/history");
  }
  return result;
}
