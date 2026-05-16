import type { Database, Json } from "@/types/supabase";
import { createClient } from "@/supabase/server";
import { mapAuditLogRow } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

type AuditPayload = {
  entityName: string;
  entityId?: string;
  action: "create" | "update" | "delete" | "status_change" | "login" | "logout" | "payment" | "refund";
  actorUserId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: unknown;
};

function toAuditInsert(payload: AuditPayload): Database["public"]["Tables"]["audit_logs"]["Insert"] {
  return {
    entity_name: payload.entityName,
    entity_id: payload.entityId,
    action: payload.action,
    actor_user_id: payload.actorUserId,
    before_state: (payload.beforeState ?? null) as Json | null,
    after_state: (payload.afterState ?? null) as Json | null,
    metadata: (payload.metadata ?? null) as Json | null,
  };
}

export class AuditRepository {
  async createLog(payload: AuditPayload) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("audit_logs").insert(toAuditInsert(payload)).select("*").single();
    throwOnSupabaseError(error);
    if (!data) {
      throw new Error("Audit log creation failed.");
    }
    return mapAuditLogRow(data);
  }
}

export const auditRepository = new AuditRepository();
