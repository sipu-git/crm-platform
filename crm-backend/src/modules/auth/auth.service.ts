import bcrypt from 'bcryptjs';
import { prisma } from '../../core/database/prisma';
import { ApiError } from '../../core/utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../core/utils/jwt';
import { eventBus } from '../../core/event-bus';
import type { RegisterInput, LoginInput } from './auth.schema';

export const authService = {
  async register(input: RegisterInput) {
    const existingTenantUser = await prisma.user.findFirst({ where: { email: input.email } });
    if (existingTenantUser) throw ApiError.conflict('An account with this email already exists');

    const tenant = await prisma.tenant.create({ data: { name: input.companyName } });
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'ADMIN', // first user of a new tenant is always Admin
      },
    });

    eventBus.emit('user.registered', { userId: user.id, tenantId: tenant.id });
    return { userId: user.id, tenantId: tenant.id };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({ where: { email: input.email } });
    if (!user) throw ApiError.notFound('No account found for this email');

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) throw ApiError.unauthorized('Incorrect email or password');

    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw ApiError.unauthorized('User no longer exists');

    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
    };
  },
};
