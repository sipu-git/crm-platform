// features/communications/communication.service.ts
import {
  CommunicationChannel,
  CommunicationStatus,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import { cacheQuery } from "../../shared/redis/query.js";
import redisService from "../../shared/redis/caching.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { toWhatsAppNumber } from "../../shared/utils/phoneZone.js";
import { SendCommunicationDto } from "./dto/communication.dto.js";
import { SendCommunicationContext } from "./dto/send-communication.dto.js";
import { whatsAppService } from "./integrations/whatsapp/services/whatsapp.service.js";

const NOT_YET_IMPLEMENTED = new Set<CommunicationChannel>([
  CommunicationChannel.EMAIL,
  CommunicationChannel.CALL,
  CommunicationChannel.SMS,
  CommunicationChannel.INTERNAL_NOTE,
]);

export const communicationService = {
  async send(data: SendCommunicationDto, ctx: SendCommunicationContext) {
    const { leadId, tenantId, companyId, createdBy } = ctx;

    if (!Object.values(CommunicationChannel).includes(data.channel)) {
      throw new ApiError(400, `Unsupported communication channel: ${data.channel}`);
    }

    if (NOT_YET_IMPLEMENTED.has(data.channel)) {
      throw new ApiError(400, `${data.channel} channel is not implemented yet`);
    }

    const lead = await prisma.leads.findFirst({
      where: { id: leadId },
      select: {
        id: true,
        tenant_id: true,
        companyId: true,
        contact: {
          select: { phone: true },
        },
      },
    });
    if (!lead?.contact?.phone) {
      throw new ApiError(404, "Lead not found");
    }

    switch (data.channel) {
      case CommunicationChannel.WHATSAPP:
        return this.sendWhatsApp(data, {
          leadId,
          tenantId,
          companyId,
          createdBy,
          leadPhone: lead.contact.phone,
        });
      default:
        throw new ApiError(400, `${data.channel} channel is not implemented yet`);
    }
  },

  async sendWhatsApp(
    data: SendCommunicationDto,
    ctx: SendCommunicationContext & { leadPhone: string | null }
  ) {
    const rawTo = data.to ?? ctx.leadPhone;
    if (!rawTo) {
      throw new ApiError(400, "No phone number available for this lead — add one before messaging via WhatsApp");
    }
    const to = toWhatsAppNumber(rawTo);

    const communication = await prisma.communications.create({
      data: {
        tenant_id: ctx.tenantId,
        lead_id: ctx.leadId,
        contact_id: data.contactId ?? null,
        company_id: ctx.companyId ?? null,
        deal_id: data.dealId ?? null,
        channel: data.channel,
        message_type: data.messageType,
        direction: data.direction,
        body: data.body,
        status: CommunicationStatus.QUEUED,
        created_by: ctx.createdBy,
      },
    });

    // A new communications row exists now regardless of send outcome below —
    // bust the cached list immediately so it doesn't serve a stale result.
    await redisService.delete(`communications-${ctx.tenantId}-${ctx.leadId}`);

    try {
      const response = await whatsAppService.sendTextMessage(to, data.body ?? "");

      return await prisma.communications.update({
        where: { id: communication.id },
        data: {
          status: CommunicationStatus.SENT,
          provider_message_id: response.messages[0].id,
          metaData: response as any,
        },
      });
    } catch (err) {
      await prisma.communications.update({
        where: { id: communication.id },
        data: {
          status: CommunicationStatus.FAILED,
          metaData: { error: err instanceof Error ? err.message : String(err) },
        },
      });
      throw err;
    }
  },

  async viewCommunications(tenantId: string, leadId: string) {
    const redisCache = `communications-${tenantId}-${leadId}`;
    return cacheQuery(redisCache, 200, async () => {
      const findLead = await prisma.leads.findFirst({
        where: { id: leadId, tenant_id: tenantId },
        include: { contact: true },
      });

      if (!findLead) {
        throw new ApiError(404, "Lead not found");
      }

      const communications = await prisma.communications.findMany({
        where: { lead_id: leadId, tenant_id: tenantId },
        include: { contact: true },
        orderBy: { created_at: "desc" },
      });

      return {
        contact: findLead.contact,
        communications,
      };
    });
  },
};