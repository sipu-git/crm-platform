import { authService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { successResponse } from '../../shared/utils/ApiResponse.js';
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const authController = {
    async register(req, res) {
        const input = registerSchema.parse(req.body);
        const result = await authService.register(input);
        res.status(201).json(successResponse('User created successfully', result));
    },
    async login(req, res) {
        const input = loginSchema.parse(req.body);
        const { accessToken, refreshToken, user } = await authService.login(input);
        res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
        return res.json({ accessToken, user });
    },
    async refresh(req, res) {
        const { accessToken, user } = await authService.refresh(req.cookies?.refreshToken);
        res.json({ accessToken, user });
    },
    async logout(_req, res) {
        res.clearCookie('refreshToken', { path: '/' });
        res.status(204).send();
    },
};
