import { prisma } from "../../../lib/prisma";
import { eventBus } from "../../shared/event-bus";
import { cacheQuery } from "../../shared/redis/query";
import { ApiError } from "../../shared/utils/ApiError";
import { leadsRepository } from "../lead/lead.repository";
import { dealRepository } from "./deal.repository";
import { UpdateStageInput } from "./deal.schema";
import { pipelineRepository } from "./pipeline.repository";
import redisService from '../../shared/redis/caching';

export const dealService = {
  async getById(tenantId: string, id: string) {
    const cacheKey = `deal-get-${tenantId}-${id}`;
    return cacheQuery(cacheKey, 400, async () => {
      const deal = await prisma.$transaction(async (tx) => {
        return dealRepository.findById(tx, tenantId, id);
      })
      if (!deal) throw ApiError.notFound("Deal not found");
      return deal;
    })
  },

  async list(tenantId: string, ownerId: string) {
    const cacheKey = `deal-list-${tenantId}-${ownerId}`;
    return cacheQuery(cacheKey, 200, async () => {
      const deal = await prisma.$transaction(async (tx) => {
        return dealRepository.findMany(tx, tenantId, ownerId);
      })
      if (!deal) throw ApiError.notFound("Deal not found");
      return deal;
    })
  },

  async board(tenantId: string) {
    const cacheKey = `deal-board-${tenantId}`;
    return cacheQuery(cacheKey, 500, async () => {
      const deal = await prisma.$transaction(async (tx) => {
        return dealRepository.findGroupedByStage(tx, tenantId);
      })
      if (!deal) throw ApiError.notFound("Deal not found");
      return deal;
    })
  },

  async moveStage(tenantId: string, id: string, stageId: string) {
    const stage = await prisma.$transaction(async (tx) => {
      const deal = await dealRepository.findById(tx, tenantId, id);
      if (!deal) throw ApiError.notFound("Deal not found");

      const [currentStage, targetStage] = await Promise.all([
        pipelineRepository.findStageById(tx, tenantId, deal.stage_id),
        pipelineRepository.findStageById(tx, tenantId, stageId)
      ]);
      if (!targetStage) throw ApiError.notFound("Target stage not found");
      if (!currentStage) throw ApiError.notFound("Current stage not found");

      if (targetStage.sort_order < currentStage.sort_order) {
        throw ApiError.badRequest(
          `Cannot move deal backward from "${currentStage.name}" to "${targetStage.name}"`
        );
      }

      await dealRepository.moveStage(tx, tenantId, id, stageId);
      return { deal, targetStage };
    });

    eventBus.emit("deal.stage_changed", {
      tenantId,
      dealId: id,
      stage: stage.targetStage.name,
    });

    if (stage.targetStage.is_won) {
      eventBus.emit("deal.won", { tenantId, dealId: id });
    } else if (stage.targetStage.is_lost) {
      eventBus.emit("deal.lost", { tenantId, dealId: id });
    }

    await Promise.all([
      redisService.delete(`deal-get-${tenantId}-${id}`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.delete(`deal-board-${tenantId}`)
    ]);

    return stage;
  },

  async update(tenantId: string, id: string, data: UpdateStageInput) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.update(tx, tenantId, id, data)
    })
    await Promise.all([
      redisService.deleteByPattern(`deal-get-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}-*`)
    ])

    return deal;
  },

  async delete(tenantId: string, id: string) {
    const deal = await prisma.$transaction(async (tx) => {
      const existingDeal = await tx.deal.findUnique({
        where: { id, tenant_id: tenantId },
        select: { lead_id: true },
      });

      if (!existingDeal) return null;

      const removeDeal = dealRepository.delete(tx, tenantId, id);
      const removeLead = leadsRepository.deleteLead(tx, tenantId, existingDeal.lead_id);
      return Promise.all([removeDeal, removeLead]);
    });
    await Promise.all([
      redisService.deleteByPattern(`deal-get-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}-*`)
    ])

    return deal;
  },
};