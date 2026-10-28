import { prisma } from "../../../../lib/prisma";
import { cacheQuery } from "../../../shared/redis/query";
import { ApiError } from "../../../shared/utils/ApiError";
import { CreateAssignInputs } from "../validations/assign.schema";
import { assignRepository } from "../repository/assign.repository";
import { assignLead } from "../assignLead.util";

export const assigneeService = {
  create(tenantId: string, leadId: string, data: CreateAssignInputs, userId?: string) {
    return assignLead(tenantId, leadId, data, false, userId);
  },

  reassign(tenantId: string, leadId: string, data: CreateAssignInputs, userId?: string) {
    return assignLead(tenantId, leadId, data, true, userId);
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