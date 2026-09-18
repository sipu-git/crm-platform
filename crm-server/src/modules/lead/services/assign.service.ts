import { prisma } from "../../../../lib/prisma";
import { cacheQuery } from "../../../shared/redis/query";
import { ApiError } from "../../../shared/utils/ApiError";
import { CreateAssignInputs } from "../validations/assign.schema";
import redisService from '../../../shared/redis/caching';
import { assignRepository } from "../repository/assign.repository";
import { leadsRepository } from "../repository/lead.repository";
import { eventBus } from "../../../shared/event-bus";

export const assigneeService = {
  async create(tenantId: string, leadId: string, data: CreateAssignInputs) {
    const lead = await prisma.$transaction(async (tx) => {
      const existingLead = await leadsRepository.findById(tx, tenantId, leadId);

      if (!existingLead) {
        throw ApiError.notFound("Lead Record doesn't exist!");
      }

      if (existingLead.assignee) {
        throw ApiError.badRequest("Lead is already assigned");
      }

      if (data.assignId && !data.userId) {
        // Treat assignId as a possible userId fallback – validate the user exists and has SALES_REP role
        const fallbackUser = await tx.user.findFirst({
          where: { id: data.assignId, tenantId },
          select: { id: true, role: true },
        });
        if (!fallbackUser) {
          throw ApiError.notFound('User not found in this workspace');
        }
        if (fallbackUser.role !== 'SALES_REP') {
          throw ApiError.badRequest('Only users with the SALES_REP role can receive and be assigned leads');
        }
        // Assign to data.userId for repository handling
        data.userId = data.assignId;
      }

      if (data.userId) {
        const user = await tx.user.findFirst({
          where: { id: data.userId, tenantId },
          select: { id: true, full_name: true, role: true, email: true },
        });
        if (!user) {
          throw ApiError.notFound("User not found in this workspace");
        }
        if (user.role !== "SALES_REP") {
          throw ApiError.badRequest("Only users with the SALES_REP role can receive and be assigned leads");
        }
        if (!data.full_name) {
          data.full_name = user.full_name;
        }
      }

      return assignRepository.create(tx, tenantId, leadId, data);
    });

    const resolvedUserId = data.userId ?? lead.assignee?.userId ?? lead.assignee?.user?.id ??
      null;

    await Promise.all([
      redisService.delete(`assign-list-${tenantId}`),
      redisService.deleteByPattern(`assign-list-${tenantId}-*`),
      redisService.deleteByPattern(`assign-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-get-${tenantId}-*`),
      redisService.deleteByPattern(`lead-list-${tenantId}-*`),
    ]);

    eventBus.emit("lead.assigned", { leadId, tenantId, assignedTo: resolvedUserId });

    return { lead };
  },

  async list(tenantId: string) {
    const redisCache = `assign-list-${tenantId}`;
    return cacheQuery(redisCache, 400, async () =>
      prisma.$transaction((tx) => assignRepository.findAllByTenant(tx, tenantId))
    );
  },

  async getById(tenantId: string, id: string) {
    const redisCache = `assign-get-${tenantId}-${id}`;
    return cacheQuery(redisCache, 300, async () => {
      const assignee = await prisma.$transaction((tx) => assignRepository.viewAssignee(tx, tenantId, id));
      if (!assignee) throw ApiError.notFound("Assignee not found");
      return assignee;
    });
  },

  async viewOwnAssignee(tenantId: string, userId: string) {
    const redisCache = `assign-get-${tenantId}-${userId}`;
    return cacheQuery(redisCache, 300, async () => {
      const result = await prisma.$transaction((tx) => assignRepository.viewOwnAssignee(tx, tenantId, userId));
      if (!result) throw ApiError.notFound("Assignee not found");
      return result;
    });
  },
}