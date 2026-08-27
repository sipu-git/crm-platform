import { prisma } from "../../../../lib/prisma";

export const deviceTokenRepository = {
  findByUser(tenantId: string, userId: string) {
    return prisma.deviceToken.findMany({
      where: { tenant_id: tenantId, user_id: userId },
    });
  },

  upsert(tenantId: string, userId: string, token: string) {
    return prisma.deviceToken.upsert({
      where: { token },
      update: { last_used_at: new Date(), user_id: userId, tenant_id: tenantId },
      create: { tenant_id: tenantId, user_id: userId, token },
    });
  },

  remove(token: string) {
    return prisma.deviceToken.deleteMany({ where: { token } });
  },

  removeMany(tokens: string[]) {
    return prisma.deviceToken.deleteMany({ where: { token: { in: tokens } } });
  },
};
