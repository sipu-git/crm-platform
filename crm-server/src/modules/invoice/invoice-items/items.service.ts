import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { invoiceItemsRepository } from "./invoice-items.repository";
import { computeInvoiceItemAmounts, recomputeInvoiceItemAmounts } from "./items-calculation";
import type { CreateInvoiceItemInput, UpdateInvoiceItemInput } from "./invoice-items.schema";
import { ApiError } from "../../../shared/utils/ApiError";
import { invoiceRepository } from "../total-invoices/invoice.repository";
import { prisma } from "../../../../lib/prisma";

async function findInvoiceOrThrow(tx: PrismaClientTx, tenantId: string, invoiceId: string) {
    const invoice = await invoiceRepository.findById(tx, tenantId, invoiceId);
    if (!invoice) throw ApiError.notFound("Invoice not found");
    return invoice;
}

async function recalculateInvoiceTotals(tx: PrismaClientTx, tenantId: string, invoiceId: string) {
    const items = await invoiceItemsRepository.findAllByInvoice(tx, invoiceId);

    const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
    const discount_amount = items.reduce((sum, item) => sum + Number(item.discount_amount), 0);
    const taxable_amount = items.reduce((sum, item) => sum + Number(item.taxable_amount), 0);
    const cgst_amount = items.reduce((sum, item) => sum + Number(item.cgst_amount), 0);
    const sgst_amount = items.reduce((sum, item) => sum + Number(item.sgst_amount), 0);
    const igst_amount = items.reduce((sum, item) => sum + Number(item.igst_amount), 0);
    const tax_amount = cgst_amount + sgst_amount + igst_amount;
    const total_amount = items.reduce((sum, item) => sum + Number(item.total_amount), 0);

    const invoice = await invoiceRepository.findById(tx, tenantId, invoiceId);
    if (!invoice) throw ApiError.notFound("Invoice not found");
    const amount_due = total_amount - Number(invoice.amount_paid);

    await invoiceRepository.updateTotals(tx, invoiceId, {
        subtotal,
        discount_amount,
        taxable_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        tax_amount,
        total_amount,
        amount_due,
    });
}

export const invoiceItemsService = {
    async list(tenantId: string, invoiceId: string) {
        return prisma.$transaction(async (tx) => {
            await findInvoiceOrThrow(tx, tenantId, invoiceId);
            return invoiceItemsRepository.findAllByInvoice(tx, invoiceId);
        });
    },

    async getById(tenantId: string, invoiceId: string, itemId: string) {
        return prisma.$transaction(async (tx) => {
            await findInvoiceOrThrow(tx, tenantId, invoiceId);

            const item = await invoiceItemsRepository.findById(tx, itemId);
            if (!item || item.invoice_id !== invoiceId) {
                throw ApiError.notFound("Invoice item not found");
            }
            return item;
        });
    },

    async create(tenantId: string, invoiceId: string, data: CreateInvoiceItemInput) {
        return prisma.$transaction(async (tx) => {
            const invoice = await findInvoiceOrThrow(tx, tenantId, invoiceId);

            if (invoice.status !== "DRAFT") {
                throw ApiError.badRequest("Cannot add items to an invoice that has already been sent");
            }

            const computed = computeInvoiceItemAmounts(data);
            const item = await invoiceItemsRepository.create(tx, invoiceId, computed);

            await recalculateInvoiceTotals(tx, tenantId, invoiceId);
            return item;
        });
    },

    async update(tenantId: string, invoiceId: string, itemId: string, patch: UpdateInvoiceItemInput) {
        return prisma.$transaction(async (tx) => {
            const invoice = await findInvoiceOrThrow(tx, tenantId, invoiceId);
            if (invoice.status !== "DRAFT") {
                throw ApiError.badRequest("Cannot edit items on an invoice that has already been sent");
            }

            const existing = await invoiceItemsRepository.findById(tx, itemId);
            if (!existing || existing.invoice_id !== invoiceId) {
                throw ApiError.notFound("Invoice item not found");
            }

            const computed = recomputeInvoiceItemAmounts(
                {
                    description: existing.description,
                    quantity: Number(existing.quantity),
                    unit_price: Number(existing.unit_price),
                    discount_amount: Number(existing.discount_amount),
                    taxable_amount: Number(existing.taxable_amount),
                    tax_rate: Number(existing.tax_rate),
                    cgst_rate: Number(existing.cgst_rate),
                    cgst_amount: Number(existing.cgst_amount),
                    sgst_rate: Number(existing.sgst_rate),
                    sgst_amount: Number(existing.sgst_amount),
                    igst_rate: Number(existing.igst_rate),
                    igst_amount: Number(existing.igst_amount),
                    tax_amount: Number(existing.cgst_amount) + Number(existing.sgst_amount) + Number(existing.igst_amount),
                    total_amount: Number(existing.total_amount),
                    hsn_code: existing.hsn_code ?? undefined,
                    sac_code: existing.sac_code ?? undefined,
                },
                patch
            );

            const updated = await invoiceItemsRepository.update(tx, itemId, computed);
            await recalculateInvoiceTotals(tx, tenantId, invoiceId);
            return updated;
        });
    },

    async delete(tenantId: string, invoiceId: string, itemId: string) {
        return prisma.$transaction(async (tx) => {
            const invoice = await findInvoiceOrThrow(tx, tenantId, invoiceId);
            if (invoice.status !== "DRAFT") {
                throw ApiError.badRequest("Cannot remove items from an invoice that has already been sent");
            }

            const existing = await invoiceItemsRepository.findById(tx, itemId);
            if (!existing || existing.invoice_id !== invoiceId) {
                throw ApiError.notFound("Invoice item not found");
            }

            await invoiceItemsRepository.delete(tx, itemId);
            await recalculateInvoiceTotals(tx, tenantId, invoiceId);
        });
    },
};