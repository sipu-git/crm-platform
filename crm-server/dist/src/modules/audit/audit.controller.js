import { auditService } from './audit.service.js';
export const auditController = {
    async history(req, res) {
        const { entityType, entityId } = req.query;
        const logs = await auditService.history(req.tenantId, entityType, entityId);
        res.json(logs);
    },
};
