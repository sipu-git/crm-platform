export async function generateInvoiceNumber(tx, tenantId) {
    const count = await tx.invoice.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}
