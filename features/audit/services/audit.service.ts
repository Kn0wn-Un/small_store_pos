import { auditRepository } from "../repositories/audit.repository";

export class AuditService {
  async log(payload: Parameters<typeof auditRepository.createLog>[0]) {
    return auditRepository.createLog(payload);
  }
}

export const auditService = new AuditService();
