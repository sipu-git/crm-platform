import { PrismaClientTx } from "../../shared/utils/prisma.types";

export const projectRepository = {
    create(tx: PrismaClientTx, tenantId: string, company_id: string,
        ownerId: string, lead_id: string, contactId: string, creator: string, data: any) {
        return tx.project.create({
            data: {
                tenant_id: tenantId,
                companyId: company_id,
                owner_id: ownerId,
                contact_id: contactId,
                project_name: data.project_name,
                project_type: data.project_type,
                description: data.description,
                status: data.status,
                start_date: data.start_date,
                originating_lead_id: lead_id,
                due_date: data.due_date,
                budget: data.budget,
                created_by: creator,
            },
        })
    },
    findProject(tx: PrismaClientTx, tenantId: string, id: string) {
        return tx.project.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
   
    modifyProject(tx: PrismaClientTx, tenantId: string, id: string, data: any) {
        return tx.project.update({
            where: { id, tenant_id: tenantId },
            data,
        });
    },
}