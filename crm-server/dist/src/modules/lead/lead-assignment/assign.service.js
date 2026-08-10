import { prisma } from "../../../../lib/prisma.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { assignRepository } from "./assign.repository.js"; // adjust filename to match yours
export const assigneeService = {
    async create(tenantId, data) {
        return prisma.$transaction((tx) => assignRepository.create(tx, tenantId, data));
    },
    async list(tenantId) {
        return prisma.$transaction((tx) => assignRepository.findAllByTenant(tx, tenantId));
    },
    async getById(tenantId, id) {
        const assignee = await prisma.$transaction((tx) => assignRepository.viewAssignee(tx, tenantId, id));
        if (!assignee)
            throw ApiError.notFound("Assignee not found");
        return assignee;
    },
};
