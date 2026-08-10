import { InvoiceStatus } from "../../../../generated/prisma/enums.js";
import { prisma } from "../../../../lib/prisma.js";
import { eventBus } from "../../../shared/event-bus/index.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { invoiceRepository } from "./invoice.repository.js";
export const invoiceService = {
    async list(tenantId, status, dealId) {
        const invoice = await prisma.$transaction(async (tx) => {
            return invoiceRepository.findMany(tx, tenantId, status, dealId);
        });
        return invoice;
    },
    async getById(tenantId, id) {
        const invoice = await prisma.$transaction(async (tx) => {
            const findInvoice = await invoiceRepository.findById(tx, tenantId, id);
            if (!findInvoice)
                throw ApiError.notFound('Invoice not found');
            return findInvoice;
        });
        return invoice;
    },
    async updateInvoice(tenantId, invoiceId, data) {
        const invoice = await prisma.$transaction(async (tx) => {
            const findInvoice = await invoiceRepository.findById(tx, tenantId, invoiceId);
            if (!findInvoice)
                throw ApiError.notFound('Invoice not found');
            return invoiceRepository.update(tx, invoiceId, data);
        });
        return invoice;
    },
    async markPaid(tenantId, id) {
        const invoice = await prisma.$transaction(async (tx) => {
            const existing = await invoiceRepository.findById(tx, tenantId, id);
            if (!existing)
                throw ApiError.notFound('Invoice not found');
            if (existing.status === InvoiceStatus.PAID) {
                throw ApiError.badRequest('Invoice is already marked as paid');
            }
            const remaining = Number(existing.total_amount) - Number(existing.amount_paid);
            return invoiceRepository.recordPayment(tx, id, remaining, 0, new Date(), InvoiceStatus.PAID);
        });
        eventBus.emit('invoice.paid', { invoiceId: id, tenantId, dealId: invoice.deal_id });
        return invoice;
    },
};
