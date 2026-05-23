"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import type { ActionResult } from "@/types/action-result";
import { clearPosCartIdCookie } from "../utils/pos-cart-cookie";
import { posCheckoutService } from "../services/pos-checkout.service";
import type { PosCheckoutResult } from "../types/pos.types";

export async function posCheckoutAction(payload: unknown): Promise<ActionResult<PosCheckoutResult>> {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) {
    return { success: false, message: auth.message, data: null, errors: auth.errors };
  }

  const result = await posCheckoutService.execute(payload);
  if (result.success) {
    await clearPosCartIdCookie();
    revalidatePath("/admin/pos");
    revalidatePath("/cashier/pos");
    revalidatePath("/pos");
    revalidatePath("/pos/history");
    revalidatePath("/admin/orders");
  }
  return result;
}
