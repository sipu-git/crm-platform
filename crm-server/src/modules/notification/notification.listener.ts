import { eventBus } from '../../core/event-bus';
import { notificationService } from './notification.service';
import { prisma } from '../../core/database/prisma';

/**
 * Listens across nearly every domain event and turns the relevant ones
 * into user-facing notifications. This is the one module that's allowed
 * to "know about" many other modules' events — that's its whole job.
 */
export function registerNotificationListeners() {
  eventBus.on('lead.created', async (payload: { leadId: string; tenantId: string; assignedTo?: string }) => {
    if (!payload.assignedTo) return;
    const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
    if (!lead) return;
    await notificationService.dispatch(
      payload.tenantId,
      payload.assignedTo,
      'lead_assigned',
      `New lead assigned: ${lead.name}`
    );
  });

  eventBus.on('deal.won', async (payload: { dealId: string; tenantId: string }) => {
    const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
    if (!deal) return;
    await notificationService.dispatch(
      payload.tenantId,
      deal.ownerId,
      'deal_won',
      `Deal won: ${deal.title}`
    );
  });

  eventBus.on('invoice.paid', async (payload: { invoiceId: string; tenantId: string; dealId?: string }) => {
    if (!payload.dealId) return;
    const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
    if (!deal) return;
    await notificationService.dispatch(
      payload.tenantId,
      deal.ownerId,
      'invoice_paid',
      `Invoice paid for deal: ${deal.title}`
    );
  });
}
