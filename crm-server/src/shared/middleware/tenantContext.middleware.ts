import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

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
