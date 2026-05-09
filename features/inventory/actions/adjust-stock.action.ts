"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { adjustStockService } from "../services/adjust-stock.service";

export async function adjustStockAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success || !auth.data) return auth;

  const result = await adjustStockService.execute(payload, auth.data);
  if (result.success) {
    revalidatePath("/admin/inventory");
    revalidatePath("/pos");
  }
  return result;
}
