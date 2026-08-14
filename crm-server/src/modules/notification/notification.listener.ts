import { prisma } from "../../../lib/prisma.js";
import { eventBus } from "../../shared/event-bus/index.js";
import { notificationService } from "./notification.service.js";

export function registerNotificationListeners() {
  eventBus.on(
    "lead.created",
    async (_payload: { leadId: string; tenantId: string }) => {
    }
  );

  // Fired from lead.service.ts assign().
  eventBus.on(
    "lead.assigned",
    async (payload: { leadId: string; tenantId: string; assignedTo: string }) => {
      const lead = await prisma.leads.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      await notificationService.dispatch(payload.tenantId, payload.assignedTo, {
        channel: "in_app",
        subject: "New lead assigned",
        message: `New lead assigned: ${lead.company_name}`,
        externalRef: payload.leadId,
      });
    }
  );

  eventBus.on(
    "lead.status_changed",
    async (payload: { leadId: string; tenantId: string; assignedTo?: string; status: string }) => {
      if (!payload.assignedTo) return;
      const lead = await prisma.leads.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      await notificationService.dispatch(payload.tenantId, payload.assignedTo, {
        channel: "in_app",
        subject: "Lead status updated",
        message: `${lead.company_name} moved to ${payload.status}`,
        externalRef: payload.leadId,
      });
    }
  );

  eventBus.on(
    "lead.qualified",
    async (payload: { leadId: string; tenantId: string; assignedTo?: string }) => {
      if (!payload.assignedTo) return;
      const lead = await prisma.leads.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      await notificationService.dispatch(payload.tenantId, payload.assignedTo, {
        channel: "in_app",
        subject: "Lead qualified",
        message: `Lead qualified: ${lead.company_name}`,
        externalRef: payload.leadId,
      });
    }
  );

  eventBus.on(
    "lead.converted",
    async (payload: { leadId: string; tenantId: string; assignedTo?: string; dealId: string }) => {
      if (!payload.assignedTo) return;
      const lead = await prisma.leads.findUnique({ where: { id: payload.leadId } });
      if (!lead) return;

      await notificationService.dispatch(payload.tenantId, payload.assignedTo, {
        channel: "in_app",
        subject: "Lead converted",
        message: `${lead.company_name} converted to a deal`,
        externalRef: payload.dealId,
      });
    }
  );

  // ── Deal lifecycle ───────────────────────────────────────────────
  eventBus.on(
    "deal.created",
    async (payload: { dealId: string; tenantId: string }) => {
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      await notificationService.dispatch(payload.tenantId, deal.owner_id, {
        channel: "in_app",
        subject: "New deal created",
        message: `New deal created: ${deal.title}`,
        externalRef: payload.dealId,
      });
    }
  );

  eventBus.on(
    "deal.stage_changed",
    async (payload: { dealId: string; tenantId: string; stage: string }) => {
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      await notificationService.dispatch(payload.tenantId, deal.owner_id, {
        channel: "in_app",
        subject: "Deal stage updated",
        message: `${deal.title} moved to ${payload.stage}`,
        externalRef: payload.dealId,
      });
    }
  );

  eventBus.on("deal.won", async (payload: { dealId: string; tenantId: string }) => {
    const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
    console.log("[deal.won] deal lookup result:", deal ? { id: deal.id, owner_id: deal.owner_id, title: deal.title } : null);
    if (!deal) return;

    await notificationService.dispatch(payload.tenantId, deal.owner_id, {
      channel: "in_app",
      subject: "Deal won",
      message: `Deal won: ${deal.title}`,
      externalRef: payload.dealId,
    });
    console.log("[deal.won] dispatch() completed");
  });

  eventBus.on("deal.lost", async (payload: { dealId: string; tenantId: string; reason?: string }) => {
    const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
    if (!deal) return;

    await notificationService.dispatch(payload.tenantId, deal.owner_id, {
      channel: "in_app",
      subject: "Deal lost",
      message: payload.reason
        ? `Deal lost: ${deal.title} (${payload.reason})`
        : `Deal lost: ${deal.title}`,
      externalRef: payload.dealId,
    });
  });

  // ── Invoice lifecycle ────────────────────────────────────────────
  eventBus.on(
    "invoice.created",
    async (payload: { invoiceId: string; tenantId: string; dealId?: string }) => {
      if (!payload.dealId) return;
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      await notificationService.dispatch(payload.tenantId, deal.owner_id, {
        channel: "in_app",
        subject: "Invoice created",
        message: `Invoice created for deal: ${deal.title}`,
        externalRef: payload.invoiceId,
      });
    }
  );

  eventBus.on(
    "invoice.paid",
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

  eventBus.on(
    "invoice.overdue",
    async (payload: { invoiceId: string; tenantId: string; dealId?: string }) => {
      if (!payload.dealId) return;
      const deal = await prisma.deal.findUnique({ where: { id: payload.dealId } });
      if (!deal) return;

      await notificationService.dispatch(payload.tenantId, deal.owner_id, {
        channel: "in_app",
        subject: "Invoice overdue",
        message: `Invoice overdue for deal: ${deal.title}`,
        externalRef: payload.invoiceId,
      });
    }
  );
}