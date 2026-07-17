import { eventBus } from '../../shared/event-bus';
import { ApiError } from '../../shared/utils/ApiError';
import { invoiceRepository } from './invoice.repository';
import type { CreateInvoiceInput } from './invoice.schema';

export const invoiceService = {
  list(tenantId: string, status?: string) {
    return invoiceRepository.findMany(tenantId, status);
  },

  async getById(tenantId: string, id: string) {
    const invoice = await invoiceRepository.findById(tenantId, id);
    if (!invoice) throw ApiError.notFound('Invoice not found');
    return invoice;
  },

  async create(tenantId: string, input: CreateInvoiceInput) {
    const invoice = await invoiceRepository.create(tenantId, input);
    eventBus.emit('invoice.created', { invoiceId: invoice.id, tenantId, dealId: input.dealId });
    return invoice;
  },

  /**
   * Admin/Manager only — enforced at the route layer via requireRole,
   * not just hidden in the frontend.
   */
  async markPaid(tenantId: string, id: string) {
    const result = await invoiceRepository.markPaid(tenantId, id);
    if (result.count === 0) throw ApiError.notFound('Invoice not found');

    const invoice = await invoiceRepository.findById(tenantId, id);
    eventBus.emit('invoice.paid', { invoiceId: id, tenantId, dealId: invoice?.deal_id });
    return invoice;
  },
};
