import { prisma } from "../../../lib/prisma.js";
import { eventBus } from "../../shared/event-bus/index.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { dealRepository } from "./deal.repository.js";
import { pipelineRepository } from "./pipeline.repository.js";
export const dealService = {
    async getById(tenantId, id) {
        const deal = await prisma.$transaction(async (tx) => {
            return dealRepository.findById(tx, tenantId, id);
        });
        if (!deal)
            throw ApiError.notFound("Deal not found");
        return deal;
    },
    async list(tenantId, ownerId) {
        const deal = await prisma.$transaction(async (tx) => {
            return dealRepository.findMany(tx, tenantId, ownerId);
        });
        if (!deal)
            throw ApiError.notFound("Deal not found");
        return deal;
    },
    async board(tenantId) {
        const deal = await prisma.$transaction(async (tx) => {
            return dealRepository.findGroupedByStage(tx, tenantId);
        });
        if (!deal)
            throw ApiError.notFound("Deal not found");
        return deal;
    },
    async moveStage(tenantId, id, stageId) {
        const stage = await prisma.$transaction(async (tx) => {
            const [deal, targetStage] = await Promise.all([
                dealRepository.findById(tx, tenantId, id),
                pipelineRepository.findStageById(tx, tenantId, stageId)
            ]);
            if (!deal)
                throw ApiError.notFound("Deal not found");
            if (!targetStage)
                throw ApiError.notFound("Target stage not found");
            await dealRepository.moveStage(tx, tenantId, id, stageId);
            return { deal, targetStage };
        });
        if (stage.targetStage.is_won) {
            console.log("[moveStage] emitting deal.won", { tenantId, dealId: id, is_won: stage.targetStage.is_won });
            eventBus.emit("deal.won", { tenantId, dealId: id });
        }
        else if (stage.targetStage.is_lost) {
            eventBus.emit("deal.lost", { tenantId, dealId: id });
        }
        return stage;
    },
    async update(tenantId, id, data) {
        const deal = await prisma.$transaction(async (tx) => {
            return dealRepository.update(tx, tenantId, id, data);
        });
        return deal;
    },
    async delete(tenantId, id) {
        const deal = await prisma.$transaction(async (tx) => {
            return dealRepository.delete(tx, tenantId, id);
        });
        return deal;
    },
};
