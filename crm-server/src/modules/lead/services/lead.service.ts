import type { CreateLeadInput, LeadFilters, UpdateLeadInput } from '../validations/lead.schema.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { LeadStatus } from '../../../../generated/prisma/enums.js';
import { prisma } from '../../../../lib/prisma.js';
import { addDays } from 'date-fns';
import { LeadStatusOrder } from '../lead.util.js';
import { cacheQuery } from '../../../shared/redis/query.js';
import { leadsRepository } from '../repository/lead.repository.js';
import redisService from '../../../shared/redis/caching.js';
import { pipelineRepository } from '../../deal/repositories/pipeline.repository.js';
import { dealRepository } from '../../deal/repositories/deal.repository.js';
import type { AccessTokenPayload } from '../../../shared/utils/jwt.js';
import { userRepository } from '../../users/user.repository.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendInviteEmail } from '../../mail/services/invite-email.service.js';
import { env } from '../../../shared/configs/env.js';
import { getEnquiryBudgetForLead } from '../../deal/utils/enquiryBudget.util.js';

export const leadService = {
  async list(tenantId: string, filters: LeadFilters, user: AccessTokenPayload) {
    const redisKey = `lead-list-${tenantId}-${user.role}-${user.userId}-${JSON.stringify(filters)}`;
    return cacheQuery(redisKey, 200, async () => {
      return prisma.$transaction(async (tx) => {
        return leadsRepository.findMany(tx, tenantId, filters, user);
      });
    })
  },

  async getById(tenantId: string, id: string, user: AccessTokenPayload) {
    const redisKey = `lead-get-${tenantId}-${user.role}-${user.userId}-${id}`;
    return cacheQuery(redisKey, 300, async () => {
      const lead = await prisma.$transaction(async (tx) => {
        return leadsRepository.findById(tx, tenantId, id, user);
      })
      if (!lead) throw ApiError.notFound('Lead not found');
      return lead;
    })
  },

  async updateStatus(tenantId: string, id: string, status: LeadStatus, actingUserId: string, user: AccessTokenPayload) {
    const result = await prisma.$transaction(async (tx) => {
      const lead = await leadsRepository.findById(tx, tenantId, id, user);

      if (!lead) {
        throw ApiError.notFound("Lead not found");
      }

      if (lead.status === status) {
        throw ApiError.badRequest(`Lead is already ${status}`);
      }

      const currentIndex = LeadStatusOrder.indexOf(lead.status)
      const targetIndex = LeadStatusOrder.indexOf(status)
      if (currentIndex === -1 || targetIndex === -1) {
        throw ApiError.badRequest(`Unrecognized lead status transition: ${lead.status} → ${status}`);
      }

      if (targetIndex < currentIndex) {
        throw ApiError.badRequest(`Cannot move lead backward from "${lead.status}" to "${status}"`);
      }

      const updatedLead = await leadsRepository.updateStatus(tx, tenantId, id, status);
      let deal = null;

      if (status === "QUALIFIED") {
        const defaultStage = await pipelineRepository.findDefaultStage(tx, tenantId);

        if (!defaultStage) {
          throw ApiError.notFound("No pipeline configured for this tenant");
        }
        deal = await dealRepository.findByLead(tx, tenantId, lead.id);
        if (!deal) {
          // Try to resolve the enquiry budget for this lead so the deal amount
          // is pre-populated instead of defaulting to 0.
          const enquiryAmount = await getEnquiryBudgetForLead(tx, tenantId, lead.id);

          deal = await dealRepository.create(tx, tenantId, actingUserId, {
            title: `${lead.company_name} opportunity`,
            leadId: lead.id,
            contactId: lead.contactId,
            stageId: defaultStage.id,
            expectedCloseDate: addDays(new Date(), 30),
            amount: enquiryAmount ? enquiryAmount.toNumber() : 0,
          });
        } else if (deal.amount.equals(0)) {
          // Deal already exists but still has a 0 amount — try back-filling from enquiry
          const enquiryAmount = await getEnquiryBudgetForLead(tx, tenantId, lead.id);
          if (enquiryAmount) {
            deal = await tx.deal.update({
              where: { id: deal.id },
              data: { amount: enquiryAmount },
            });
          }
        }
      }

      return { lead: updatedLead, deal };
    });
    await Promise.all([
      redisService.deleteByPattern(`lead-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}`),
    ])

    eventBus.emit("lead.status_changed", {
      leadId: id,
      tenantId,
      status,
    });
    if (result.deal) {
      eventBus.emit("deal.created", { tenantId, dealId: result.deal.id, leadId: id });
    }

    return result;
  },

  async updateLead(tenantId: string, id: string, data: any, user: AccessTokenPayload) {
    const lead = await prisma.$transaction(async (tx) => {
      const lead = await leadsRepository.findById(tx, tenantId, id, user);
      if (!lead) throw ApiError.notFound('Lead not found');
      return leadsRepository.updateLead(tx, tenantId, id, data);
    });
    await Promise.all([
      redisService.deleteByPattern(`lead-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-list-${tenantId}-*`),
    ])
    if (!lead) throw ApiError.notFound('Lead not found');
    return lead;
  },

  async delete(tenantId: string, id: string, user: AccessTokenPayload) {
    const lead = await prisma.$transaction(async (tx) => {
      const existing = await leadsRepository.findById(tx, tenantId, id, user);
      if (!existing) throw ApiError.notFound('Lead not found');
      return leadsRepository.deleteLead(tx, tenantId, id);
    })
    await Promise.all([
      redisService.deleteByPattern(`lead-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-list-${tenantId}-*`)
    ])
    eventBus.emit("lead.deleted", { leadId: id, tenantId });
    return lead;
  },

  async searchLeads(tenantId: string, query: string, limit: number, user: AccessTokenPayload) {
    const leads = await prisma.$transaction(async (tx) => {
      return leadsRepository.search(tx, tenantId, query, limit, user);
    })
    return leads;
  },

  async convertToClient(tenantId: string, id: string, user: AccessTokenPayload) {
    const result = await prisma.$transaction(async (tx) => {
      const lead = await leadsRepository.findById(tx, tenantId, id, user);
      if (!lead) throw ApiError.notFound("Lead not found");

      if (lead.status !== "QUALIFIED") {
        throw ApiError.badRequest("Lead must be QUALIFIED before converting to client");
      }
      if (!lead.contact?.email) {
        throw ApiError.badRequest("Lead contact must have an email address to convert");
      }

      // Check if user already exists with this email
      let clientUser = await tx.user.findFirst({
        where: { tenantId, email: lead.contact.email.toLowerCase() },
      });

      let isNewClient = false;

      if (!clientUser) {
        // Create new CLIENT user from lead contact info
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hash = await bcrypt.hash(randomPassword, 12);

        clientUser = await tx.user.create({
          data: {
            tenantId,
            email: lead.contact.email.toLowerCase(),
            full_name: `${lead.contact.first_name || ""} ${lead.contact.last_name || ""}`.trim() || lead.company_name || "Unknown",
            company_name: lead.company_name,
            company_id: lead.contact.companyId,
            password: hash,
            mobile: lead.contact.phone ?? "",
            role: "CLIENT",
          },
        });
        isNewClient = true;
      }

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
      const tenantName = tenant?.name || lead.company_name || "ClearView Workspace";
      const email = lead.contact.email.trim().toLowerCase();
      const fullName = `${lead.contact.first_name || ""} ${lead.contact.last_name || ""}`.trim() || lead.company_name || "Client";

      const token = crypto.randomBytes(32).toString("base64url");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await tx.invite.updateMany({
        where: { tenant_id: tenantId, email, role: "CLIENT", status: "PENDING" },
        data: { status: "EXPIRED" },
      });

      await tx.invite.create({
        data: {
          tenant_id: tenantId,
          email,
          role: "CLIENT",
          full_name: fullName,
          mobile: lead.contact.phone || "",
          token_hash: tokenHash,
          invited_by_id: user.userId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await sendInviteEmail({
        fullName,
        email,
        role: "CLIENT",
        companyName: tenantName,
        acceptUrl: `${env.clientUrl}/accept-invite?token=${encodeURIComponent(token)}`,
      });
      // Update lead status to CONVERTED
      const updatedLead = await leadsRepository.updateStatus(tx, tenantId, id, "CONVERTED" as LeadStatus);

      return {
        lead: updatedLead,
        clientUser: { id: clientUser.id, full_name: clientUser.full_name, email: clientUser.email, role: clientUser.role },
        isNewClient
      };
    });

    await Promise.all([
      redisService.deleteByPattern(`lead-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-list-${tenantId}-*`),
    ]);

    eventBus.emit("lead.converted", { leadId: id, tenantId, clientUserId: result.clientUser.id, isNewClient: result.isNewClient });

    return result;
  },
};
