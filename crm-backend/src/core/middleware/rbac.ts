import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type Role = 'ADMIN' | 'MANAGER' | 'REP';

/**
 * Role check enforced at the middleware layer — never rely on the
 * frontend hiding a button as the only protection for an Admin-only action.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.auth.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}
