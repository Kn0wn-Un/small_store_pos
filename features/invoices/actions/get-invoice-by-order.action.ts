"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { invoicesService } from "../services/invoices.service";

export async function getInvoiceByOrderAction(payload: { orderId: string }) {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  if (!auth.success) return auth;

  return invoicesService.getByOrderId(payload.orderId);
}
