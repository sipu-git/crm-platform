import { prisma } from '../../../../lib/prisma.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { invoiceRepository } from './invoice.repository.js';

export function registerInvoiceListeners() {
  eventBus.on(
    "deal.won",
    async (payload: { dealId: string; tenantId: string }) => {
      console.log("[invoice][deal.won] received", payload);

      try {
        const deal = await prisma.deal.findUnique({
          where: { id: payload.dealId, tenant_id: payload.tenantId },
        });

        if (!deal) {
          console.error(`[invoice][deal.won] deal ${payload.dealId} not found for tenant ${payload.tenantId}`);
          return;
        }

        if (deal.amount == null) {
          console.error(`[invoice][deal.won] deal ${payload.dealId} has null amount, cannot create invoice`);
          return;
        }

        const amount = typeof deal.amount === "number" ? deal.amount : deal.amount.toNumber();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        await prisma.$transaction(async (tx) => {
          await invoiceRepository.createDraftFromDeal(
            tx, payload.tenantId, deal.id, amount, dueDate
          );
        });

        console.log(`[invoice][deal.won] invoice created for deal ${deal.id}`);
      } catch (err) {
        console.error(`[invoice][deal.won] handler failed for deal ${payload.dealId}:`, err);
      }
    }
  );
}