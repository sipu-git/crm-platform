import { prisma } from "../../../lib/prisma";
import { CreateContactInput, UpdateContactInput } from "./contact.schema";

export const contactsRepository = {
  create(tenantId: string, createdBy: string, input: CreateContactInput) {
    return prisma.contacts.create({
      data: {
        tenant_id: tenantId,
        company_id: input.companyId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        created_by: createdBy,
        updated_at: new Date(),
      },
    });
  },

  findById(tenantId: string, id: string) {
    return prisma.contacts.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  findMany(tenantId: string) {
    return prisma.contacts.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
  },

  findByCompany(tenantId: string, companyId: string) {
    return prisma.contacts.findMany({
      where: { tenant_id: tenantId, company_id: companyId },
      orderBy: { created_at: "desc" },
    });
  },

  findByEmail(tenantId: string, email: string) {
    return prisma.contacts.findFirst({
      where: { tenant_id: tenantId, email },
    });
  },

  update(tenantId: string, id: string, input: UpdateContactInput) {
    return prisma.contacts.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        company_id: input.companyId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        updated_at: new Date(),
      },
    });
  },

  delete(tenantId: string, id: string) {
    return prisma.contacts.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  },
};