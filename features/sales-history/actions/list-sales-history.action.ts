"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { salesHistoryService } from "../services/sales-history.service";
import type { SalesHistoryMode } from "../types/sales-history.types";

export async function listSalesHistoryAction(mode: SalesHistoryMode, payload: unknown) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success || !auth.data) return auth;

  return salesHistoryService.listSales(auth.data, mode, payload);
}
