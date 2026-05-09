import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import type { DbTransaction } from "@/lib/transaction";

export class AuditRepository {
  async createLog(payload: {
    entityName: string;
    entityId?: string;
    action: "create" | "update" | "delete" | "status_change" | "login" | "logout" | "payment" | "refund";
    actorUserId?: string;
    beforeState?: unknown;
    afterState?: unknown;
    metadata?: unknown;
  }) {
    const [created] = await db.insert(auditLogs).values(payload).returning();
    return created;
  }

  async createLogTx(
    tx: DbTransaction,
    payload: {
      entityName: string;
      entityId?: string;
      action: "create" | "update" | "delete" | "status_change" | "login" | "logout" | "payment" | "refund";
      actorUserId?: string;
      beforeState?: unknown;
      afterState?: unknown;
      metadata?: unknown;
    },
  ) {
    await tx.insert(auditLogs).values(payload);
  }
}

export const auditRepository = new AuditRepository();
