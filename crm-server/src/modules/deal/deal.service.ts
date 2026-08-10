import { prisma } from "../../../lib/prisma";
import { eventBus } from "../../shared/event-bus";
import { ApiError } from "../../shared/utils/ApiError";
import { dealRepository } from "./deal.repository";
import { UpdateStageInput } from "./deal.schema";
import { pipelineRepository } from "./pipeline.repository";

export const dealService = {
  async getById(tenantId: string, id: string) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.findById(tx, tenantId, id);
    })
    if (!deal) throw ApiError.notFound("Deal not found");
    return deal;
  },

  async list(tenantId: string, ownerId: string) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.findMany(tx, tenantId, ownerId);
    })
    if (!deal) throw ApiError.notFound("Deal not found");
    return deal;
  },

  async board(tenantId: string) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.findGroupedByStage(tx, tenantId);
    })
    if (!deal) throw ApiError.notFound("Deal not found");
    return deal;
  },

  async moveStage(tenantId: string, id: string, stageId: string) {
    const stage = await prisma.$transaction(async (tx) => {
      const [deal, targetStage] = await Promise.all([
        dealRepository.findById(tx, tenantId, id),
        pipelineRepository.findStageById(tx, tenantId, stageId)
      ])
      if (!deal) throw ApiError.notFound("Deal not found");
      if (!targetStage) throw ApiError.notFound("Target stage not found");
      await dealRepository.moveStage(tx, tenantId, id, stageId);
      return { deal, targetStage }
    })
    if (stage.targetStage.is_won) {
      console.log("[moveStage] emitting deal.won", { tenantId, dealId: id, is_won: stage.targetStage.is_won });
      eventBus.emit("deal.won", { tenantId, dealId: id });
    }
    else if (stage.targetStage.is_lost) {
      eventBus.emit("deal.lost", { tenantId, dealId: id });
    }
    return stage;
  },

  async update(tenantId: string, id: string, data: UpdateStageInput) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.update(tx, tenantId, id, data)
    })
    return deal;
  },

  async delete(tenantId: string, id: string) {
    const deal = await prisma.$transaction(async (tx) => {
      return dealRepository.delete(tx, tenantId, id);
    })
    return deal;
  },
};