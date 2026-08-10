export const assignRepository = {
    create(tx, tenantId, data) {
        return tx.assignee.create({
            data: {
                tenant_id: tenantId,
                full_name: data.full_name,
                designation: data.designation,
                department: data.department,
                userId: data.userId ?? null,
            }
        });
    },
    viewAssignee(tx, tenantId, id) {
        return tx.assignee.findFirst({
            where: {
                id, tenant_id: tenantId
            },
            include: {
                leads: true
            },
        });
    },
    findAllByTenant(tx, tenantId) {
        return tx.assignee.findMany({
            where: { tenant_id: tenantId },
            orderBy: { full_name: "asc" },
            include: {
                leads: true
            },
        });
    },
};
