import { ApiError } from '../../../shared/utils/ApiError.js';
import { eventBus } from '../../../shared/event-bus/index.js';
import { LeadStatus } from '../../../../generated/prisma/enums.js';
import { prisma } from '../../../../lib/prisma.js';
import { addDays } from 'date-fns';
import { LeadStatusOrder, PaginationParams } from '../lead.util.js';
import { cacheQuery } from '../../../shared/redis/query.js';
import { leadsRepository } from '../repository/lead.repository.js';
import redisService from '../../../shared/redis/caching.js';
import { pipelineRepository } from '../../deal/repositories/pipeline.repository.js';
import { dealRepository } from '../../deal/repositories/deal.repository.js';
import type { AccessTokenPayload } from '../../../shared/utils/jwt.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendInviteEmail } from '../../mail/services/invite-email.service.js';
import { env } from '../../../shared/configs/env.js';
import { getEnquiryBudgetForLead } from '../../deal/utils/enquiryBudget.util.js';
import { LeadFilters } from '../validations/lead.schema.js';
import { projectService } from '../../projects/project.service.js';
import { z } from 'zod';

const clientEmailSchema = z.string().trim().email().refine((email) => {
  const normalized = email.toLowerCase();
  const [localPart, domain] = normalized.split('@');
  return ![
    'invalid.local',
    'example.com',
    'example.org',
    'example.net',
    'example.invalid',
  ].includes(domain ?? '')
    && !/^(test|invalid|unknown|placeholder|no-?reply)([.+_-]|$)/i.test(localPart ?? '');
}, 'Use a real client email address, not a placeholder.');

export function isUsableClientEmail(email: string | null | undefined): email is string {
  return typeof email === 'string' && clientEmailSchema.safeParse(email).success;
}

type ConversionOptions = {
  tenantId: string;
  leadId?: string;
  actorUserId: string;
  accessUser?: AccessTokenPayload;
  wonDealId?: string;
};

async function convertQualifiedLeadToClient(options: ConversionOptions) {
  const { tenantId, wonDealId } = options;
  let leadId = options.leadId ?? '';
  const automated = Boolean(wonDealId);

  const result = await prisma.$transaction(async (tx) => {
    let actorUserId = options.actorUserId;

    if (wonDealId) {
      const deal = await tx.deal.findFirst({
        where: { id: wonDealId, tenant_id: tenantId },
        include: { pipeline: true },
      });
      if (!deal) return { kind: 'skipped' as const, reason: 'Deal was not found in this tenant.' };
      if (!deal.pipeline.is_won || (leadId && deal.lead_id !== leadId)) {
        return { kind: 'skipped' as const, reason: 'Deal is no longer won for this lead.' };
      }
      leadId = deal.lead_id;

      const dealOwner = await tx.user.findFirst({
        where: { id: deal.owner_id, tenantId },
        select: { id: true },
      });
      if (!dealOwner) return { kind: 'skipped' as const, reason: 'Deal owner is not a member of this tenant.' };
      actorUserId = dealOwner.id;
    }

    const lead = await leadsRepository.findById(tx, tenantId, leadId, options.accessUser);
    if (!lead) {
      if (automated) return { kind: 'skipped' as const, reason: 'Lead was not found in this tenant.' };
      throw ApiError.notFound('Lead not found');
    }

    const email = lead.contact?.email?.trim().toLowerCase();
    if (!isUsableClientEmail(email)) {
      if (automated) return { kind: 'skipped' as const, reason: 'Lead contact has no usable client email address.' };
      throw ApiError.badRequest('Lead contact must have a usable email address to convert');
    }

    const findClient = () => tx.user.findFirst({
      where: { tenantId, email, role: 'CLIENT' },
      select: { id: true, full_name: true, email: true, role: true },
    });

    if (lead.status === 'CONVERTED') {
      const clientUser = await findClient();
      if (!clientUser) {
        if (automated) return { kind: 'skipped' as const, reason: 'Lead is already converted but its client account is missing.' };
        throw ApiError.badRequest('Lead is already converted, but the client account could not be found');
      }
      const project = wonDealId
        ? await projectService.addClientToWonDealProject(tx, tenantId, wonDealId, clientUser.id)
        : null;
      return { kind: 'converted' as const, lead, clientUser, isNewClient: false, alreadyConverted: true, projectId: project?.id };
    }

    if (lead.status !== 'QUALIFIED') {
      if (automated) return { kind: 'skipped' as const, reason: 'Lead is not qualified for client conversion.' };
      throw ApiError.badRequest('Lead must be QUALIFIED before converting to client');
    }

    const existingUser = await tx.user.findFirst({
      where: { tenantId, email },
      select: { id: true, role: true },
    });
    if (existingUser && existingUser.role !== 'CLIENT') {
      if (automated) return { kind: 'skipped' as const, reason: 'Contact email already belongs to a non-client account.' };
      throw ApiError.badRequest('Contact email already belongs to a non-client account');
    }

    // Claim conversion with a conditional update so duplicate deal.won events cannot
    // create multiple client invitations for the same lead.
    const claim = await tx.leads.updateMany({
      where: { id: leadId, tenant_id: tenantId, status: 'QUALIFIED' },
      data: { status: 'CONVERTED' },
    });
    if (claim.count !== 1) {
      const latestLead = await leadsRepository.findById(tx, tenantId, leadId);
      const clientUser = await findClient();
      if (latestLead?.status === 'CONVERTED' && clientUser) {
        const project = wonDealId
          ? await projectService.addClientToWonDealProject(tx, tenantId, wonDealId, clientUser.id)
          : null;
        return { kind: 'converted' as const, lead: latestLead, clientUser, isNewClient: false, alreadyConverted: true, projectId: project?.id };
      }
      if (automated) return { kind: 'skipped' as const, reason: 'Lead conversion was claimed by another request.' };
      throw ApiError.badRequest('Lead is no longer available for conversion');
    }

    let clientUser = await findClient();
    let isNewClient = false;

    if (!clientUser) {
      const randomPassword = crypto.randomBytes(8).toString('hex');
      const hash = await bcrypt.hash(randomPassword, 12);
      const createdUser = await tx.user.create({
        data: {
          tenantId,
          email,
          full_name: `${lead.contact?.first_name || ''} ${lead.contact?.last_name || ''}`.trim() || lead.company_name || 'Unknown',
          company_name: lead.company_name,
          company_id: lead.contact?.companyId,
          password: hash,
          mobile: lead.contact?.phone ?? '',
          role: 'CLIENT',
        },
      });
      clientUser = {
        id: createdUser.id,
        full_name: createdUser.full_name,
        email: createdUser.email,
        role: createdUser.role,
      };
      isNewClient = true;
    }

    const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    const tenantName = tenant?.name || lead.company_name || 'ClearView Workspace';
    const fullName = `${lead.contact?.first_name || ''} ${lead.contact?.last_name || ''}`.trim() || lead.company_name || 'Client';
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await tx.invite.updateMany({
      where: { tenant_id: tenantId, email, role: 'CLIENT', status: 'PENDING' },
      data: { status: 'EXPIRED' },
    });
    await tx.invite.create({
      data: {
        tenant_id: tenantId,
        email,
        role: 'CLIENT',
        full_name: fullName,
        mobile: lead.contact?.phone || '',
        token_hash: tokenHash,
        invited_by_id: actorUserId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const updatedLead = await leadsRepository.findById(tx, tenantId, leadId);
    const project = wonDealId
      ? await projectService.addClientToWonDealProject(tx, tenantId, wonDealId, clientUser.id)
      : null;

    // Keep invitation delivery in the transaction so a failed send rolls back the
    // conversion claim; retries then have a chance to send the invitation.
    await sendInviteEmail({
      fullName,
      email,
      role: 'CLIENT',
      companyName: tenantName,
      acceptUrl: `${env.clientUrl}/accept-invite?token=${encodeURIComponent(token)}`,
    });

    return { kind: 'converted' as const, lead: updatedLead, clientUser, isNewClient, alreadyConverted: false, projectId: project?.id };
  });

  if (result.kind === 'skipped') return { converted: false as const, reason: result.reason };

  await Promise.all([
    redisService.deleteByPattern(`lead-get-${tenantId}-*`),
    redisService.deleteByPattern(`lead-list-${tenantId}-*`),
    ...(result.projectId
      ? [
          redisService.delete(`project-${tenantId}-${result.projectId}`),
          redisService.delete(`project-all-${tenantId}`),
          redisService.delete(`project-list-${result.clientUser.id}`),
        ]
      : []),
  ]);

  if (!result.alreadyConverted) {
    eventBus.emit('lead.converted', {
      leadId,
      tenantId,
      clientUserId: result.clientUser.id,
      isNewClient: result.isNewClient,
    });
  }

  return {
    converted: true as const,
    lead: result.lead,
    clientUser: result.clientUser,
    isNewClient: result.isNewClient,
    alreadyConverted: result.alreadyConverted,
    projectId: result.projectId,
  };
}

export const leadService = {
  async list(tenantId: string, filters: LeadFilters, user: AccessTokenPayload, params: PaginationParams) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 8, 1), 100);

    const redisKey = `lead-list-${tenantId}-${user.role}-${user.userId}-${JSON.stringify(filters)}-p${page}:l${limit}`;
    return cacheQuery(redisKey, 200, async () => {
      return prisma.$transaction(async (tx) => {
        return leadsRepository.findMany(tx, tenantId, filters, user, { page, limit });
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
    const result = await convertQualifiedLeadToClient({
      tenantId,
      leadId: id,
      actorUserId: user.userId,
      accessUser: user,
    });
    if (!result.converted) throw ApiError.badRequest(result.reason);
    return result;
  },

  async convertQualifiedLeadAfterWonDeal(tenantId: string, dealId: string) {
    return convertQualifiedLeadToClient({
      tenantId,
      actorUserId: '',
      wonDealId: dealId,
    });
  },
};
