import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../configs/env';
import { Role } from '../configs/role';
import { Sign } from 'node:crypto';

export interface AccessTokenPayload {
  userId: string;
  tenantId: string;
  role: Role;
}


export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry as SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry as SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: string };
}
