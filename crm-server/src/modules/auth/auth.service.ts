import { prisma } from '../../../lib/prisma';
import { eventBus } from '../../shared/event-bus';
import { ApiError } from '../../shared/utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import type { RegisterInput, LoginInput } from './auth.schema';
import bcrypt from 'bcrypt'

export const authService = {
  async register(input: RegisterInput) {
    const existingTenantUser = await prisma.user.findFirst({ where: { email: input.email } });
    if (existingTenantUser) throw new ApiError('An account with this email already exists', 400);

    const tenant = await prisma.tenant.create({ data: { name: input.company_name } });
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        full_name: input.full_name,
        company_name: input.company_name,
        email: input.email,
        password: passwordHash,
        role: 'ADMIN',
      },
    });

    eventBus.emit('user.registered', { userId: user.id, tenantId: tenant.id });
    return { userId: user.id, tenantId: tenant.id };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({ where: { email: input.email } });
    if (!user) throw new ApiError('No account found for this email', 404);

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) throw new ApiError('Incorrect email or password', 400);

    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new ApiError('Missing refresh token', 400);

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new ApiError('User no longer exists');

    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return {
      accessToken,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  },
};
