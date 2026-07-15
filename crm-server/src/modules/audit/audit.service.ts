import { auditRepository } from './audit.repository';

export const auditService = {
  record(tenantId: string, action: string, entityType: string, entityId: string, userId?: string, metadata?: unknown) {
    return auditRepository.create(tenantId, action, entityType, entityId, userId, metadata);
  },

  history(tenantId: string, entityType: string, entityId: string) {
    return auditRepository.findByEntity(tenantId, entityType, entityId);
  },
};
