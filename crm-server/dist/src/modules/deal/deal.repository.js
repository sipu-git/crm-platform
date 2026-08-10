export const dealRepository = {
    findMany(tx, tenantId, ownerId) {
        return tx.deal.findMany({
            where: { tenant_id: tenantId, ...(ownerId ? { owner_id: ownerId } : {}) },
            include: {
                contact: true, pipeline: true,
                owner: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                leads: {
                    include: {
                        assignee: true,
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            },
        });
    },
    findById(tx, tenantId, id) {
        return tx.deal.findFirst({
            where: { id, tenant_id: tenantId },
            include: {
                contact: true, pipeline: true, owner: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                leads: {
                    include: {
                        assignee: true,
                    }
                }
            },
        });
    },
    create(tx, tenantId, ownerId, data) {
        return tx.deal.create({
            data: {
                tenant_id: tenantId,
                owner_id: ownerId,
                title: data.title,
                amount: data.amount,
                lead_id: data.leadId,
                contact_id: data.contactId,
                stage_id: data.stageId,
                expected_close_date: data.expectedCloseDate,
            },
        });
    },
    findGroupedByStage(tx, tenantId) {
        return tx.pipeline.findMany({
            where: { tenant_id: tenantId },
            orderBy: { sort_order: "asc" },
            include: {
                deals: {
                    where: { tenant_id: tenantId },
                    include: {
                        contact: { select: { first_name: true, last_name: true } },
                    },
                    orderBy: { created_at: "desc" },
                },
            },
        });
    },
    moveStage(tx, tenantId, dealId, stageId) {
        return tx.deal.updateMany({
            where: {
                id: dealId,
                tenant_id: tenantId
            },
            data: {
                stage_id: stageId
            }
        });
    },
    update(tx, tenantId, dealId, data) {
        return tx.deal.updateMany({
            where: {
                id: dealId,
                tenant_id: tenantId
            },
            data,
        });
    },
    delete(tx, tenantId, dealId) {
        return tx.deal.deleteMany({
            where: {
                id: dealId,
                tenant_id: tenantId
            }
        });
    }
};
