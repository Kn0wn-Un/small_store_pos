"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { listPosProductsService } from "../services/list-pos-products.service";

export async function listPosProductsAction(payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return auth;
  return listPosProductsService.execute(payload);
}
