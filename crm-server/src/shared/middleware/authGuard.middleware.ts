import { NextFunction, Request, Response } from "express";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith('Bearer ') ? header.replace('Bearer ', '') : undefined;
  const cookieToken = req.cookies?.access_token;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    return next(ApiError.unauthorized('Missing access token'));
  }

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}