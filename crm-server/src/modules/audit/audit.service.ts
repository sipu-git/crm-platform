import { AuditEntityType } from '../../../generated/prisma/enums.js';
import { auditRepository } from './audit.repository.js';

export const auditService = {
  record(tenantId: string, action: string, entityType: AuditEntityType, entityId: string, userId?: string, metadata?: unknown) {
    return auditRepository.create(tenantId, action, entityType, entityId, userId, metadata);
  },

  history(tenantId: string, entityType: AuditEntityType, entityId: string) {
    return auditRepository.findByEntity(tenantId, entityType, entityId);
  },
};
