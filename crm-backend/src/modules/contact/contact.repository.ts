import { prisma } from '../../core/database/prisma';
import type { CreateContactInput, UpdateContactInput } from './contact.schema';

export const contactRepository = {
  findMany(tenantId: string, search?: string) {
    return prisma.contact.findMany({
      where: {
        tenantId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.contact.findFirst({ where: { id, tenantId } });
  },

  findByEmail(tenantId: string, email: string) {
    return prisma.contact.findFirst({ where: { tenantId, email } });
  },

  create(tenantId: string, data: CreateContactInput) {
    return prisma.contact.create({ data: { ...data, tenantId } });
  },

  update(tenantId: string, id: string, data: UpdateContactInput) {
    return prisma.contact.updateMany({ where: { id, tenantId }, data });
  },

  remove(tenantId: string, id: string) {
    return prisma.contact.deleteMany({ where: { id, tenantId } });
  },
};
