import { z } from 'zod';
import { InvoiceStatus, InvoiceType } from '../../../../generated/prisma/enums.js';
export const createInvoiceSchema = z.object({
    dealId: z.string().min(1).optional(),
    contactId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    invoice_type: z.enum(InvoiceType).default('B2B'),
    status: z.enum(InvoiceStatus).default('DRAFT'),
    issue_date: z.coerce.date(),
    due_date: z.coerce.date(),
    currency: z.string().default('INR'),
    // Seller snapshot — usually defaulted server-side from tenant settings,
    // but overridable per-invoice if needed.
    seller_name: z.string().min(1),
    seller_gstin: z.string().optional(),
    seller_address: z.string().optional(),
    seller_state: z.string().optional(),
    // Buyer snapshot
    buyer_name: z.string().min(1),
    buyer_gstin: z.string().optional(),
    buyer_address: z.string().optional(),
    buyer_state: z.string().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
    // At least one line item required — an invoice with zero items isn't valid.
    items: z.array(z.object({
        description: z.string().min(1),
        quantity: z.coerce.number().positive().default(1),
        unit_price: z.coerce.number().nonnegative(),
        discount_amount: z.coerce.number().nonnegative().default(0),
        cgst_rate: z.coerce.number().nonnegative().default(0),
        sgst_rate: z.coerce.number().nonnegative().default(0),
        igst_rate: z.coerce.number().nonnegative().default(0),
        hsn_code: z.string().optional(),
        sac_code: z.string().optional(),
    })).min(1, 'At least one line item is required'),
});
export const updateInvoiceSchema = createInvoiceSchema.partial();
export const recordPaymentSchema = z.object({
    amount: z.coerce.number().positive(),
    paid_at: z.coerce.date().default(() => new Date()),
});
export const listInvoicesQuerySchema = z.object({
    dealId: z.string().min(1).optional(),
    contactId: z.string().min(1).optional(),
    companyId: z.string().min(1).optional(),
    status: z.enum(InvoiceStatus).optional(),
});
