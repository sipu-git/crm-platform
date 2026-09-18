import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema, listUsersQuerySchema } from './auth.schema.js';
import { env } from '../../../shared/configs/env.js';
import { successResponse } from '../../../shared/utils/ApiResponse.js';

const getRefreshCookieOptions = (req: Request) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(successResponse('User created successfully', result));
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user, permissions } = await authService.login(input);
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions(req));
    return res.json({ accessToken, refreshToken, user, permissions });
  },

  async listUsers(req: Request, res: Response) {
    const query = listUsersQuerySchema.parse(req.query);
    const users = await authService.listUsers(req.auth?.tenantId!, query);
    res.status(200).json(users);
  },
  
  async refresh(req: Request, res: Response) {
    try {
      // Prioritize explicit body refreshToken from active client session
      const token =
        req.body?.refreshToken ||
        req.cookies?.refreshToken ||
        (req.headers['x-refresh-token'] as string | undefined);

      const { accessToken, refreshToken: newRefreshToken, user, permissions } =
        await authService.refresh(token);

      res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions(req));
      return res.json({ accessToken, refreshToken: newRefreshToken, user, permissions });
    } catch (error) {
      res.clearCookie('refreshToken', getRefreshCookieOptions(req));
      throw error;
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken', getRefreshCookieOptions(req));
    res.status(204).send();
  },
};
