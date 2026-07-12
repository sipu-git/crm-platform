import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  tenantId: string;
  role: 'ADMIN' | 'MANAGER' | 'REP';
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: string };
}
