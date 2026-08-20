import { prisma } from "../../../../lib/prisma";
import { cacheQuery } from "../../../shared/redis/query";
import { ApiError } from "../../../shared/utils/ApiError";
import { assignRepository } from "./assign.repository"; // adjust filename to match yours
import { CreateAssignInputs } from "./assign.schema";
import redisService from '../../../shared/redis/caching';

export const assigneeService = {
  async create(tenantId: string, data: CreateAssignInputs) {
    const assign = await prisma.$transaction((tx) => assignRepository.create(tx, tenantId, data));
    await Promise.all([
      redisService.deleteByPattern(`assign-list-${tenantId}-*`),
      redisService.deleteByPattern(`assign-get-${tenantId}-*`)
    ])
    return assign;
  },
  async list(tenantId: string) {
    const redisCache = `assign-list-${tenantId}`;
    return cacheQuery(redisCache, 400, async () =>
      prisma.$transaction((tx) => assignRepository.findAllByTenant(tx, tenantId)));
  },

  async getById(tenantId: string, id: string) {
    const redisCache = `assign-get-${tenantId}-${id}`;
    return cacheQuery(redisCache, 300, async () => {
      const assignee = await prisma.$transaction((tx) => assignRepository.viewAssignee(tx, tenantId, id));
      if (!assignee) throw ApiError.notFound("Assignee not found");
      return assignee;
    })
  },
};