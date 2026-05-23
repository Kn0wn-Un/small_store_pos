"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { salesHistoryService } from "../services/sales-history.service";
import type { SalesHistoryMode } from "../types/sales-history.types";

export async function getSalesHistoryDetailAction(mode: SalesHistoryMode, orderId: string) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success || !auth.data) return auth;

  return salesHistoryService.getDetail(auth.data, mode, orderId);
}
