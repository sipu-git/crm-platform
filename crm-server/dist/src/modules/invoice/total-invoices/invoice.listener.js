import { prisma } from '../../../../lib/prisma.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { invoiceRepository } from './invoice.repository.js';
// invoice.listener.ts
export function registerInvoiceListeners() {
    eventBus.on("deal.won", async (payload) => {
        console.log("[deal.won] received", payload); // TEMP: confirm listener fires
        const deal = await prisma.deal.findUnique({
            where: { id: payload.dealId, tenant_id: payload.tenantId }, // scope by tenant
        });
        if (!deal) {
            console.error(`[deal.won] deal ${payload.dealId} not found for tenant ${payload.tenantId}`);
            return;
        }
        if (deal.amount == null) {
            console.error(`[deal.won] deal ${payload.dealId} has null amount, cannot create invoice`);
            return;
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        try {
            await prisma.$transaction(async (tx) => {
                await invoiceRepository.createDraftFromDeal(tx, payload.tenantId, deal.id, deal.amount.toNumber(), dueDate);
            });
            console.log(`[deal.won] invoice created for deal ${deal.id}`);
        }
        catch (err) {
            console.error(`[deal.won] createDraftFromDeal failed for deal ${deal.id}:`, err);
        }
    });
}
