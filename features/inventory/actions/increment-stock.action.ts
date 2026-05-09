"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { incrementStockService } from "../services/increment-stock.service";

export async function incrementStockAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success || !auth.data) return auth;

  const result = await incrementStockService.execute(payload, auth.data);
  if (result.success) {
    revalidatePath("/admin/inventory");
    revalidatePath("/pos");
  }
  return result;
}
