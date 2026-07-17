import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { Role } from './role';

type role = Role;

export function requireRole(...allowedRoles: role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.auth.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}
