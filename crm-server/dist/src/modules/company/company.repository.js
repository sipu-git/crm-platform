export const companyRepository = {
    findManyCompanies(tx, tenantId) {
        return tx.company.findMany({
            where: { tenant_id: tenantId },
            include: {
                leads: true,
                _count: {
                    select: { leads: true },
                },
            },
            orderBy: { created_at: "desc" },
        });
    },
    findCompany(tx, tenantId, id) {
        return tx.company.findFirst({
            where: { tenant_id: tenantId, id },
            include: {
                leads: true,
            }
        });
    },
    modify(tx, tenantId, id, data) {
        return tx.company.update({
            where: { id, tenant_id: tenantId },
            data,
        });
    },
    delete(tx, tenantId, id) {
        return tx.company.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
    filterCompany(tx, tenantId, filters) {
        return tx.company.findMany({
            where: {
                tenant_id: tenantId,
                ...(filters.industry ? { industry: filters.industry } : {}),
                ...(filters.company ? { name: filters.company } : {}),
                ...(filters.page ? { website: filters.page } : {}),
                ...(filters.limit ? { website: filters.limit } : {}),
            },
            include: {
                leads: true
            },
            orderBy: { created_at: "desc" },
        });
    },
    upsertStubByName(tx, tenantId, ownerId, companyName, soruce) {
        return tx.company.upsert({
            where: {
                tenant_id_name: {
                    tenant_id: tenantId,
                    name: companyName.trim(),
                }
            },
            update: {},
            create: {
                tenant_id: tenantId,
                name: companyName.trim(),
                owner_name: ownerId,
                source: soruce ?? 'OTHER',
                company_status: 'PROSPECT',
            }
        });
    }
};
