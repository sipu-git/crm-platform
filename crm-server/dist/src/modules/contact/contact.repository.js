export const contactsRepository = {
    create(tx, tenantId, createdBy, input) {
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
    findById(tx, tenantId, id) {
        return tx.contacts.findFirst({
            where: { id, tenant_id: tenantId },
        });
    },
    findMany(tx, tenantId) {
        return tx.contacts.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: "desc" },
        });
    },
    findByCompany(tx, tenantId, companyId) {
        return tx.contacts.findMany({
            where: { tenant_id: tenantId, company_id: companyId },
            orderBy: { created_at: "desc" },
        });
    },
    findByEmail(tx, tenantId, email) {
        return tx.contacts.findFirst({
            where: { tenant_id: tenantId, email },
        });
    },
    update(tx, tenantId, id, input) {
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
    delete(tx, tenantId, id) {
        return tx.contacts.deleteMany({
            where: { id, tenant_id: tenantId },
        });
    },
};
