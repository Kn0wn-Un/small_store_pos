"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { auditService } from "../services/audit.service";

export async function createAuditLogAction(payload: Parameters<typeof auditService.log>[0]) {
  const auth = await authorizeActionRole([ROLES.ADMIN]);
  if (!auth.success) return auth;
  const created = await auditService.log(payload);
  return {
    success: true,
    message: "Audit log created.",
    data: created,
  };
}
