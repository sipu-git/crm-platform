import { prisma } from '../../../lib/prisma.js';
import { eventBus } from '../../shared/event-bus/index.js';
import { invoiceRepository } from './invoice.repository.js';
export function registerInvoiceListeners() {
    eventBus.on('deal.won', async (payload) => {
        try {
            const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
            if (!deal)
                return;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // net-14 default
            await invoiceRepository.createDraftFromDeal(payload.tenantId, deal.id, deal.title, deal.amount.toNumber(), dueDate);
        }
        catch (err) {
            console.error('Failed to auto-generate invoice on deal.won:', err);
        }
    });
}
