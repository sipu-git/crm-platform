import { NextFunction, Request, Response } from "express";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

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
