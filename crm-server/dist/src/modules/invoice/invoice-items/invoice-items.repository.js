export const invoiceItemsRepository = {
    create(tx, invoiceId, data) {
        return tx.invoiceItem.create({
            data: {
                invoice_id: invoiceId,
                description: data.description,
                quantity: data.quantity,
                unit_price: data.unit_price,
                discount_amount: data.discount_amount,
                taxable_amount: data.taxable_amount,
                cgst_rate: data.cgst_rate,
                cgst_amount: data.cgst_amount,
                sgst_rate: data.sgst_rate,
                sgst_amount: data.sgst_amount,
                igst_rate: data.igst_rate,
                igst_amount: data.igst_amount,
                tax_rate: data.cgst_rate + data.sgst_rate + data.igst_rate,
                hsn_code: data.hsn_code,
                sac_code: data.sac_code,
                total_amount: data.total_amount,
            },
        });
    },
    findById(tx, id) {
        return tx.invoiceItem.findFirst({
            where: { id },
        });
    },
    findAllByInvoice(tx, invoiceId) {
        return tx.invoiceItem.findMany({
            where: { invoice_id: invoiceId },
            orderBy: { created_at: "asc" },
        });
    },
    update(tx, id, data) {
        return tx.invoiceItem.update({
            where: { id },
            data: {
                description: data.description,
                quantity: data.quantity,
                unit_price: data.unit_price,
                discount_amount: data.discount_amount,
                taxable_amount: data.taxable_amount,
                cgst_rate: data.cgst_rate,
                cgst_amount: data.cgst_amount,
                sgst_rate: data.sgst_rate,
                sgst_amount: data.sgst_amount,
                igst_rate: data.igst_rate,
                igst_amount: data.igst_amount,
                tax_rate: data.cgst_rate + data.sgst_rate + data.igst_rate,
                hsn_code: data.hsn_code,
                sac_code: data.sac_code,
                total_amount: data.total_amount,
            },
        });
    },
    delete(tx, id) {
        return tx.invoiceItem.delete({
            where: { id },
        });
    },
};
