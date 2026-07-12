import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

/**
 * Verifies the Bearer access token and attaches the decoded payload to
 * req.auth. Every module's routes rely on this running first — it's the
 * single place JWT verification happens, not duplicated per module.
 */
export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing access token'));
  }

  const token = header.replace('Bearer ', '');
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
