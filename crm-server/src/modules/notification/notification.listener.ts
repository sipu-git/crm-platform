import { prisma } from "../../../lib/prisma";
import { eventBus } from "../../shared/event-bus";
import { notificationService } from "./notification.service";

export function registerNotificationListeners() {
  eventBus.on(
    "lead.created",
    async (payload: { leadId: string; tenantId: string; assignedTo?: string }) => {
      if (!payload.assignedTo) return;
      const lead = await prisma.leads.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      await notificationService.dispatch(payload.tenantId, payload.assignedTo, {
        channel: "in_app",
        subject: "New lead assigned",
        message: `New lead assigned: ${lead.full_name}`,
        externalRef: payload.leadId,
      });
    }
  );

  eventBus.on("deal.won", async (payload: { dealId: string; tenantId: string }) => {
    const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
    if (!deal) return;

    await notificationService.dispatch(payload.tenantId, deal.owner_id, {
      channel: "in_app",
      subject: "Deal won",
      message: `Deal won: ${deal.title}`,
      externalRef: payload.dealId,
    });
  });

  eventBus.on("invoice.paid",
    async (payload: { invoiceId: string; tenantId: string; dealId?: string }) => {
      if (!payload.dealId) return;
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      await notificationService.dispatch(payload.tenantId, deal.owner_id, {
        channel: "in_app",
        subject: "Invoice paid",
        message: `Invoice paid for deal: ${deal.title}`,
        externalRef: payload.invoiceId,
      });
    }
  );
}