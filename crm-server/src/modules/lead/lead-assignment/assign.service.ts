import { prisma } from "../../../../lib/prisma";
import { ApiError } from "../../../shared/utils/ApiError";
import { assignRepository } from "./assign.repository"; // adjust filename to match yours
import { CreateAssignInputs } from "./assign.schema";

export const assigneeService = {
  async create(tenantId: string, data: CreateAssignInputs) {
    return prisma.$transaction((tx) => assignRepository.create(tx, tenantId, data));
  },

  async list(tenantId: string) {
    return prisma.$transaction((tx) => assignRepository.findAllByTenant(tx, tenantId));
  },

  async getById(tenantId: string, id: string) {
    const assignee = await prisma.$transaction((tx) => assignRepository.viewAssignee(tx, tenantId, id));
    if (!assignee) throw ApiError.notFound("Assignee not found");
    return assignee;
  },
};