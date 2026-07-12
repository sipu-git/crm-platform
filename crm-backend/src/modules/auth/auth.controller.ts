import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { env } from '../../core/config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.login(input);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken, user });
  },

  async refresh(req: Request, res: Response) {
    const { accessToken, user } = await authService.refresh(req.cookies?.refreshToken);
    res.json({ accessToken, user });
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken', { path: '/' });
    res.status(204).send();
  },
};
