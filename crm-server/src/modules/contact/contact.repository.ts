import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";
import { CreateContactInput, UpdateContactInput } from "./contact.schema.js";

export const contactsRepository = {
  create(tx: PrismaClientTx, tenantId: string, createdBy: string, input: CreateContactInput) {
    return tx.contacts.create({
      data: {
        tenant_id: tenantId,
        companyId: input.companyId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        designation: input.designation,
        phone: input.phone,
        created_by: createdBy,
        updated_at: new Date(),
      },
    });
  },

  findById(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.contacts.findFirst({
      where: { id, tenant_id: tenantId },
    });
  },

  findMany(tx: PrismaClientTx, tenantId: string) {
    return tx.contacts.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: "desc" },
    });
  },

  findByCompany(tx: PrismaClientTx, tenantId: string, companyId: string) {
    return tx.contacts.findMany({
      where: { tenant_id: tenantId, company_id: companyId },
      orderBy: { created_at: "desc" },
    });
  },

  findByEmail(tx: PrismaClientTx, tenantId: string, email: string) {
    return tx.contacts.findFirst({
      where: { tenant_id: tenantId, email },
    });
  },

  update(tx: PrismaClientTx, tenantId: string, id: string, input: UpdateContactInput) {
    return tx.contacts.updateMany({
      where: { id, tenant_id: tenantId },
      data: {
        company_id: input.companyId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        designation: input.designation,
      },
    });
  },

  delete(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.contacts.deleteMany({
      where: { id, tenant_id: tenantId },
    });
  },
};