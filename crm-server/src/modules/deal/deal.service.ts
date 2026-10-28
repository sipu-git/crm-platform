import { prisma } from "../../../lib/prisma";
import { eventBus } from "../../shared/event-bus";
import { cacheQuery } from "../../shared/redis/query";
import { ApiError } from "../../shared/utils/ApiError";
import { UpdateStageInput } from "./deal.schema";
import redisService from '../../shared/redis/caching';
import { leadsRepository } from "../lead/repository/lead.repository";
import { dealRepository } from "./repositories/deal.repository";
import { pipelineRepository } from "./repositories/pipeline.repository";
import { projectService } from "../projects/project.service.js";

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

  async moveStage(tenantId: string, id: string, stageId: string, userId?: string) {
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

      const wonAt = targetStage.is_won
        ? deal.won_at || new Date()
        : null;
      await dealRepository.moveStage(tx, tenantId, id, stageId, wonAt);
      const updatedDeal = await dealRepository.findById(tx, tenantId, id);
      const project = targetStage.is_won
        ? await projectService.convertWonDeal(tx, tenantId, id)
        : null;
      return { deal: updatedDeal || { ...deal, stage_id: stageId }, targetStage, project };
    });

    eventBus.emit("deal.stage_changed", {
      tenantId,
      dealId: id,
      stage: stage.targetStage.name,
      userId,
    });

    if (stage.targetStage.is_won) {
      eventBus.emit("deal.won", { tenantId, dealId: id, userId });
    } else if (stage.targetStage.is_lost) {
      eventBus.emit("deal.lost", { tenantId, dealId: id, userId });
    }

    await Promise.all([
      redisService.delete(`deal-get-${tenantId}-${id}`),
      redisService.delete(`deal-board-${tenantId}`),
      redisService.deleteByPattern(`deal-get-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}*`),
      redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
      redisService.deleteByPattern(`invoice-list-${tenantId}-*`)
    ]);

    return stage;
  },

  async update(tenantId: string, id: string, data: UpdateStageInput, userId?: string) {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await dealRepository.findById(tx, tenantId, id);
      if (!existing) throw ApiError.notFound("Deal not found");

      let transition: {
        from: string;
        to: string;
        changed: boolean;
        isNewlyWon: boolean;
        isNewlyLost: boolean;
      } | null = null;
      let wonAt: Date | null | undefined;
      if (data.stageId !== undefined) {
        const [currentStage, targetStage] = await Promise.all([
          pipelineRepository.findStageById(tx, tenantId, existing.stage_id),
          pipelineRepository.findStageById(tx, tenantId, data.stageId),
        ]);
        if (!currentStage) throw ApiError.notFound("Current stage not found");
        if (!targetStage) throw ApiError.notFound("Target stage not found");
        if (targetStage.sort_order < currentStage.sort_order) {
          throw ApiError.badRequest(
            `Cannot move deal backward from "${currentStage.name}" to "${targetStage.name}"`
          );
        }

        transition = {
          from: currentStage.name,
          to: targetStage.name,
          changed: currentStage.id !== targetStage.id,
          isNewlyWon: targetStage.is_won && (!currentStage.is_won || !existing.won_at),
          isNewlyLost: targetStage.is_lost && !currentStage.is_lost,
        };
        wonAt = targetStage.is_won ? existing.won_at || new Date() : null;
        if (targetStage.is_won) {
          await projectService.convertWonDeal(tx, tenantId, id);
        }
      }

      const deal = await dealRepository.update(tx, tenantId, id, data, wonAt);
      return { deal, transition };
    });

    if (result.transition?.changed && result.deal && data.stageId !== undefined) {
      await eventBus.emit("deal.stage_changed", {
        tenantId,
        dealId: id,
        stage: result.transition.to,
        userId,
      });
      if (result.transition.isNewlyWon) {
        eventBus.emit("deal.won", { tenantId, dealId: id, userId });
      } else if (result.transition.isNewlyLost) {
        eventBus.emit("deal.lost", { tenantId, dealId: id, userId });
      }
    }
    if (result.deal) {
      eventBus.emit('deal.updated', {
        tenantId,
        dealId: id,
        userId,
        changedFields: Object.keys(data),
      });
    }

    await Promise.all([
      redisService.delete(`deal-get-${tenantId}-${id}`),
      redisService.delete(`deal-board-${tenantId}`),
      redisService.deleteByPattern(`deal-get-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}*`),
      redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
      redisService.deleteByPattern(`invoice-list-${tenantId}-*`)
    ]);

    return result.deal;
  },

  async delete(tenantId: string, id: string, userId?: string) {
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
      redisService.delete(`deal-get-${tenantId}-${id}`),
      redisService.delete(`deal-board-${tenantId}`),
      redisService.deleteByPattern(`deal-get-${tenantId}-*`),
      redisService.deleteByPattern(`deal-list-${tenantId}-*`),
      redisService.deleteByPattern(`deal-board-${tenantId}*`),
      redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
      redisService.deleteByPattern(`invoice-list-${tenantId}-*`)
    ]);

    if (deal) {
      eventBus.emit('deal.deleted', { tenantId, dealId: id, userId });
      eventBus.emit('lead.deleted', { tenantId, leadId: deal[1].id, userId });
    }
    return deal;
  },
};
