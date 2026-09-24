import { PrismaClientTx } from "../../shared/utils/prisma.types";

export const projectRepository = {
    create(tx: PrismaClientTx, tenantId: string, company_id: string,
        ownerId: string | undefined, lead_id: string, contactId: string, data: any) {
        return tx.project.create({
            data: {
                tenant_id: tenantId,
                companyId: company_id,
                ...(ownerId ? { owner_id: ownerId } : {}),
                contact_id: contactId,
                // duplicate fields removed – only core Project columns are persisted
                status: data.status,
                ...(lead_id ? { originating_lead_id: lead_id } : {}),
                ...(data.enquiry_id ? { enquiry_id: data.enquiry_id } : {}),
            },

        })
    },

    findProject(tx: PrismaClientTx, tenantId: string, id: string) {
        return tx.project.findFirst({
            where: { id, tenant_id: tenantId },
            include: {
                enquiry: true,
                company: true,
                contacts: true,
                originatingLead: true,
            }
        });
    },

    findAllProjects(tx: PrismaClientTx, tenantId: string) {
        return tx.project.findMany({
            where: { tenant_id: tenantId },
            include: {
                enquiry: true,
                originatingLead: true
            }
        });
    },
    async findOwnProjects(tx: PrismaClientTx, userId: string) {
        const user = await tx.user.findFirst({
            where: { id: userId },
            select: { email: true, role: true },
        });

        if (!user) return [];

        return tx.project.findMany({
            where: {
                ...(user.role === "CLIENT" ? {
                    OR: [
                        { contacts: { email: user.email } },
                        { enquiry: { email: user.email } },
                    ]
                } : {}),
            },
            include: { owner: true, originatingLead: true, company: true, contacts: true, enquiry: true },
        });
    },

    modifyProject(tx: PrismaClientTx, tenantId: string, id: string, data: any) {
        return tx.project.update({
            where: { id, tenant_id: tenantId },
            data,
        });
    },

}
