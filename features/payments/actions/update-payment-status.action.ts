"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { paymentsService } from "../services/payments.service";

export async function updatePaymentStatusAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return auth;

  const result = await paymentsService.updatePaymentStatus(payload);
  if (result.success) {
    revalidatePath("/admin/orders");
    revalidatePath("/pos/history");
  }
  return result;
}
