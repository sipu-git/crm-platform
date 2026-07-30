import { prisma } from "../../../lib/prisma";
export const dealRepository = {
    findMany(tenantId, ownerId) {
        return prisma.deal.findMany({
            where: { tenant_id: tenantId, ...(ownerId ? { owner_id: ownerId } : {}) },
            orderBy: [{ stage_id: "asc" }, { created_at: "asc" }],
            include: { contact: true },
        });
    },
    findById(tenantId, id) {
        return prisma.deal.findFirst({
            where: { id, tenant_id: tenantId },
            include: { contact: true },
        });
    },
    create(tenantId, ownerId, data) {
        return prisma.deal.create({
            data: {
                tenant_id: tenantId,
                owner_id: ownerId,
                title: data.title,
                value: data.value,
                contact_id: data.contactId,
                stage_id: data.stageId,
                expected_close_date: data.expectedCloseDate,
            },
        });
    },
    updateStage(tenantId, id, stageId, probability, position) {
        return prisma.deal.updateMany({
            where: { id, tenant_id: tenantId },
            data: {
                stage_id: stageId,
                probability,
                ...(position !== undefined ? { position } : {}),
                updated_at: new Date(),
            },
        });
    },
    findIdleDeals(tenantId, idleSinceDate, closedStageIds = []) {
        return prisma.deal.findMany({
            where: {
                tenant_id: tenantId,
                ...(closedStageIds.length ? { stage_id: { notIn: closedStageIds } } : {}),
                updated_at: { lt: idleSinceDate },
            },
        });
    },
};
