import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Confirms req.auth.tenantId is present and exposes it as req.tenantId for
 * convenience. Every module's repository queries must filter by this —
 * enforced by convention here, and additionally defended by Prisma
 * middleware in database/prisma.ts for defense-in-depth.
 */
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export function tenantContext(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth?.tenantId) {
    return next(ApiError.unauthorized('Missing tenant context'));
  }
  req.tenantId = req.auth.tenantId;
  next();
}
