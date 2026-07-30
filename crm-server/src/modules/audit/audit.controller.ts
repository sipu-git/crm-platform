import type { Request, Response } from 'express';
import { auditService } from './audit.service';
import { AuditEntityType } from '../../../generated/prisma/enums';

export const auditController = {
  async history(req: Request, res: Response) {
    const { entityType, entityId } = req.query as { entityType: AuditEntityType; entityId: string };
    const logs = await auditService.history(req.tenantId!, entityType, entityId);
    res.json(logs);
  },
};
