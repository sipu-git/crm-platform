import { prisma } from '../../../../lib/prisma.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { invoiceRepository } from '../repositories/invoice.repository.js';

export function registerInvoiceListeners() {
  eventBus.on(
    "deal.won",
    async (payload: { dealId: string; tenantId: string; userId?: string }) => {
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

        const invoice = await prisma.$transaction(async (tx) => {
          return invoiceRepository.createDraftFromDeal(
            tx, payload.tenantId, deal.id, amount, dueDate
          );
        });

        eventBus.emit('invoice.created', {
          invoiceId: invoice.id,
          tenantId: payload.tenantId,
          dealId: deal.id,
          userId: payload.userId,
        });
        console.log(`[invoice][deal.won] invoice created for deal ${deal.id}`);
      } catch (err) {
        console.error(`[invoice][deal.won] handler failed for deal ${payload.dealId}:`, err);
      }
    }
  );
}