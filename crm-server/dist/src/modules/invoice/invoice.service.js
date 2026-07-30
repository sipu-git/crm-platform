import { eventBus } from '../../shared/event-bus/index.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { invoiceRepository } from './invoice.repository.js';
export const invoiceService = {
    list(tenantId, status) {
        return invoiceRepository.findMany(tenantId, status);
    },
    async getById(tenantId, id) {
        const invoice = await invoiceRepository.findById(tenantId, id);
        if (!invoice)
            throw ApiError.notFound('Invoice not found');
        return invoice;
    },
    async create(tenantId, input) {
        const invoice = await invoiceRepository.create(tenantId, input);
        eventBus.emit('invoice.created', { invoiceId: invoice.id, tenantId, dealId: input.dealId });
        return invoice;
    },
    /**
     * Admin/Manager only — enforced at the route layer via requireRole,
     * not just hidden in the frontend.
     */
    async markPaid(tenantId, id) {
        const result = await invoiceRepository.markPaid(tenantId, id);
        if (result.count === 0)
            throw ApiError.notFound('Invoice not found');
        const invoice = await invoiceRepository.findById(tenantId, id);
        eventBus.emit('invoice.paid', { invoiceId: id, tenantId, dealId: invoice?.deal_id });
        return invoice;
    },
};
