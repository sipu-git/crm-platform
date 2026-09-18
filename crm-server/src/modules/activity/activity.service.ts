import { prisma } from "../../../lib/prisma.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { companyRepository } from "../company/company.repository.js";
import { contactsRepository } from "../contact/contact.repository.js";
import { dealRepository } from "../deal/repositories/deal.repository.js";
import { assignRepository } from "../lead/repository/assign.repository.js";
import { activityRepository } from "./activity.repository.js";
import type { CreateActivityInput, UpdateActivityInput, ListActivitiesQuery } from "./activity.schema.js";
import type { AccessTokenPayload } from "../../shared/utils/jwt.js";

export const activityService = {
  async list(tenantId: string, query: ListActivitiesQuery, user: AccessTokenPayload) {
    return activityRepository.findMany(tenantId, query, user);
  },

  async getById(tenantId: string, id: string, user: AccessTokenPayload) {
    const activity = await activityRepository.findById(tenantId, id, user);
    if (!activity) throw ApiError.notFound("Activity not found");
    return activity;
  },

  async create(tenantId: string, createdBy: string, data: CreateActivityInput) {
    const activity = await prisma.$transaction(async (tx) => {
      const [deal, contact, company] = await Promise.all([
        dealRepository.findById(tx, tenantId, data.dealId),
        contactsRepository.findById(tx, tenantId, data.contactId),
        companyRepository.findCompany(tx, tenantId, data.companyId),
      ]);
      if (!deal) throw ApiError.badRequest("Deal not found in this tenant");
      if (!contact) throw ApiError.badRequest("Contact not found in this tenant");
      if (!company) throw ApiError.badRequest("Company not found in this tenant");

      if (data.assignedTo) {
        const assignee = await assignRepository.viewAssignee(tx, tenantId, data.assignedTo);
        if (!assignee) throw ApiError.badRequest("Assignee not found in this tenant");
      }

      return activityRepository.create(tx, tenantId, createdBy, data);
    });
    return activity;
  },

  async update(tenantId: string, id: string, data: UpdateActivityInput, user: AccessTokenPayload) {
    const activity = await prisma.$transaction(async (tx) => {
      const existing = await activityRepository.findById(tenantId, id, user);
      if (!existing) throw ApiError.notFound("Activity not found");

      if (data.assignedTo) {
        const assignee = await assignRepository.viewAssignee(tx, tenantId, data.assignedTo);
        if (!assignee) throw ApiError.badRequest("Assignee not found in this tenant");
      }

      return activityRepository.update(tenantId, id, data);
    })
    return activity;
  },

  async complete(tenantId: string, id: string, user: AccessTokenPayload) {
    const existing = await activityRepository.findById(tenantId, id, user);
    if (!existing) throw ApiError.notFound("Activity not found");
    if (existing.status === "COMPLETED") {
      throw ApiError.badRequest("Activity is already completed");
    }

    return activityRepository.complete(tenantId, id);
  },

  async delete(tenantId: string, id: string, user: AccessTokenPayload) {
    const existing = await activityRepository.findById(tenantId, id, user);
    if (!existing) throw ApiError.notFound("Activity not found");

    await activityRepository.delete(tenantId, id);
  },


  async viewOwnActivities(tenantId: string, userId: string) {
    return activityRepository.viewOwnActivities(tenantId, userId);
  },
};
