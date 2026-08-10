export const pipelineRepository = {
    findDefaultStage(tx, tenantId) {
        return tx.pipeline.findFirst({
            where: {
                tenant_id: tenantId,
                is_won: false,
                is_lost: false,
            },
            orderBy: {
                sort_order: "asc"
            }
        });
    },
    findAllStages(tx, tenantId) {
        return tx.pipeline.findMany({
            where: {
                tenant_id: tenantId,
            },
            orderBy: {
                sort_order: "asc"
            }
        });
    },
    findStageById(tx, tenantId, stageId) {
        return tx.pipeline.findFirst({
            where: {
                tenant_id: tenantId,
                id: stageId,
            },
        });
    },
    seedDefaultStages(tx, tenantId) {
        return tx.pipeline.createMany({
            data: [
                { tenant_id: tenantId, name: "Qualified", sort_order: 1, probability: 10 },
                { tenant_id: tenantId, name: "Proposal Sent", sort_order: 2, probability: 30 },
                { tenant_id: tenantId, name: "Negotiation", sort_order: 3, probability: 60 },
                { tenant_id: tenantId, name: "Won", sort_order: 4, probability: 100, is_won: true },
                { tenant_id: tenantId, name: "Lost", sort_order: 5, probability: 0, is_lost: true },
            ],
        });
    }
};
