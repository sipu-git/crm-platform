import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../shared/utils/ApiError";
import { assignRepository } from "./repository/assign.repository";
import { leadsRepository } from "./repository/lead.repository";
import { CreateAssignInputs } from "./validations/assign.schema";
import redisService from '../../shared/redis/caching.js';
import { eventBus } from "../../shared/event-bus";

export async function assignLead(
    tenantId: string,
    leadId: string,
    data: CreateAssignInputs,
    reassign: boolean,
    userId?: string,
) {
    const lead = await prisma.$transaction(async (tx) => {
        const existingLead = await leadsRepository.findById(tx, tenantId, leadId);

        if (!existingLead) {
            throw ApiError.notFound("Lead Record doesn't exist!");
        }

        if (!reassign && existingLead.assignee) {
            throw ApiError.badRequest("Lead is already assigned");
        }
        if (reassign && !existingLead.assignee) {
            throw ApiError.badRequest("Lead is not assigned yet");
        }

        if (data.assignId && !data.userId) {
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

    const resolvedUserId = data.userId ?? lead.assignee?.userId ?? lead.assignee?.user?.id ?? null;

    await Promise.all([
        redisService.delete(`assign-list-${tenantId}`),
        redisService.deleteByPattern(`assign-list-${tenantId}-*`),
        redisService.deleteByPattern(`assign-get-${tenantId}-*`),
        redisService.deleteByPattern(`lead-get-${tenantId}-*`),
        redisService.deleteByPattern(`lead-list-${tenantId}-*`),
    ]);

    eventBus.emit("lead.assigned", { leadId, tenantId, assignedTo: resolvedUserId, userId });

    return { lead };
}