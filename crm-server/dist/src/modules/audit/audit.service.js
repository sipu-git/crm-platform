import { auditRepository } from './audit.repository.js';
export const auditService = {
    record(tenantId, action, entityType, entityId, userId, metadata) {
        return auditRepository.create(tenantId, action, entityType, entityId, userId, metadata);
    },
    history(tenantId, entityType, entityId) {
        return auditRepository.findByEntity(tenantId, entityType, entityId);
    },
};
