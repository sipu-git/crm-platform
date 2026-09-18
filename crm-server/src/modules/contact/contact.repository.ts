import { prisma } from "../../../lib/prisma.js";
import { PrismaClientTx } from "../../shared/utils/prisma.types.js";
import { CreateContactInput, UpdateContactInput } from "./contact.schema.js";

export const contactsRepository = {
  create(tx: PrismaClientTx, tenantId: string, createdBy: string | undefined, input: CreateContactInput) {
    const data = {
      tenant: { connect: { id: tenantId } },
      company: { connect: { id: input.companyId } },
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      designation: input.designation,
      phone: input.phone,
      ...(createdBy ? { user: { connect: { id: createdBy } } } : {}),
    } as any;

    return tx.contacts.upsert({
      where: { tenant_id_email: { tenant_id: tenantId, email: input.email } },
      update: {},
      create: data,
    });
  },

  findById(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.contacts.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        company: true,
        _count: {
          select: {
            lead: true
          }
        }
      }
    });
  },

  findMany(tx: PrismaClientTx, tenantId: string) {
    return tx.contacts.findMany({
      where: { tenant_id: tenantId },
      include: {
        lead: true,
        _count: {
          select: { lead: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  autoFillByEmail(tx:PrismaClientTx,tenantId:string,email:string) {
    return tx.contacts.findFirst({
      where:{
        tenant_id:tenantId,
        email:email
      },
      include:{
        company:true
      }
    })
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