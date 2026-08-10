// invoice-items.schema.ts
import { z } from 'zod';
const invoiceItemBaseSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().positive().default(1),
    unit_price: z.coerce.number().nonnegative(),
    discount_amount: z.coerce.number().nonnegative().default(0),
    tax_rate: z.coerce.number().nonnegative().default(0),
    cgst_rate: z.coerce.number().nonnegative().default(0),
    sgst_rate: z.coerce.number().nonnegative().default(0),
    igst_rate: z.coerce.number().nonnegative().default(0),
    hsn_code: z.string().optional(),
    sac_code: z.string().optional(),
    // taxable_amount, total_amount, cgst_amount, sgst_amount, igst_amount are
    // computed server-side in computeInvoiceItemAmounts — never accepted as input
});
function noMixedTaxRegime(data) {
    const hasIntraState = (data.cgst_rate ?? 0) > 0 || (data.sgst_rate ?? 0) > 0;
    const hasInterState = (data.igst_rate ?? 0) > 0;
    return !(hasIntraState && hasInterState);
}
export const createInvoiceItemSchema = invoiceItemBaseSchema.refine(noMixedTaxRegime, {
    message: 'An item cannot have both CGST/SGST and IGST — choose intra-state or inter-state, not both',
});
export const updateInvoiceItemSchema = invoiceItemBaseSchema.partial().refine(noMixedTaxRegime, {
    message: 'An item cannot have both CGST/SGST and IGST — choose intra-state or inter-state, not both',
});
export const listInvoiceItemsQuerySchema = z.object({
    invoiceId: z.string().min(1).optional(),
});
