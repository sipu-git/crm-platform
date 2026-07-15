import type { Request, Response } from 'express';
import { auditService } from './audit.service';

export const auditController = {
  async history(req: Request, res: Response) {
    const { entityType, entityId } = req.query as { entityType: string; entityId: string };
    const logs = await auditService.history(req.tenantId!, entityType, entityId);
    res.json(logs);
  },
};
