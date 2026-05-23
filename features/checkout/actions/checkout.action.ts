"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { checkoutService } from "../services/checkout.service";

export async function checkoutAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success || !auth.data) return auth;

  const result = await checkoutService.execute(payload, {
    actorUserId: auth.data.userId,
    cashierUserId: auth.data.role === ROLES.CASHIER || auth.data.role === ROLES.ADMIN ? auth.data.userId : null,
  });
  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/pos/history");
  }
  return result;
}
