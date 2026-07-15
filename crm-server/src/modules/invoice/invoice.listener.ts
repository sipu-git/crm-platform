import { eventBus } from '../../core/event-bus';
import { invoiceRepository } from './invoice.repository';
import { prisma } from '../../core/database/prisma';

/**
 * Deal Won -> auto-generate a draft invoice. This module never imports
 * the Deal module's service directly — it only listens for the event,
 * keeping the dependency one-directional (invoice depends on the event
 * contract, not on deal's internals).
 */
export function registerInvoiceListeners() {
  eventBus.on('deal.won', async (payload: { dealId: string; tenantId: string }) => {
    try {
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // net-14 default

      await invoiceRepository.createDraftFromDeal(payload.tenantId, deal.id, deal.title, deal.value, dueDate);
    } catch (err) {
      console.error('Failed to auto-generate invoice on deal.won:', err);
    }
  });
}
