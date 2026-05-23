"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { salesHistoryService } from "../services/sales-history.service";
import type { SalesHistoryMode } from "../types/sales-history.types";

export async function listSalesCashiersAction(mode: SalesHistoryMode) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success || !auth.data) return auth;

  return salesHistoryService.listCashiers(auth.data, mode);
}
