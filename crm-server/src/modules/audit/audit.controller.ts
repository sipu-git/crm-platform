import type { Request, Response } from 'express';
import { auditService } from './audit.service.js';
import { AuditEntityType } from '../../../generated/prisma/enums.js';
import { ApiError } from '../../shared/utils/ApiError.js';

export const auditController = {
  async history(req: Request, res: Response) {
    const rawEntityType = req.query.entityType;
    const rawEntityId = req.query.entityId;
    if (rawEntityType !== undefined && (
      typeof rawEntityType !== 'string'
      || !Object.values(AuditEntityType).includes(rawEntityType as AuditEntityType)
    )) {
      throw ApiError.badRequest('Invalid audit entityType');
    }
    if (rawEntityId !== undefined && (typeof rawEntityId !== 'string' || !rawEntityId.trim())) {
      throw ApiError.badRequest('Invalid audit entityId');
    }

    const entityType = rawEntityType as AuditEntityType | undefined;
    const entityId = typeof rawEntityId === 'string' ? rawEntityId : undefined;
    const logs = await auditService.history(req.tenantId!, entityType, entityId);
    res.json(logs);
  },
};
