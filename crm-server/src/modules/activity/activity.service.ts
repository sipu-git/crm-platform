import { ApiError } from '../../shared/utils/ApiError.js';
import { eventBus } from '../../shared/event-bus/index.js';
import { activityRepository } from './activity.repository.js';
import type {
  CreateActivityInput,
  UpdateActivityInput,
  ListActivitiesQuery,
} from './activity.schema.js';

export const activityService = {
  list(tenantId: string, query: ListActivitiesQuery = {}) {
    return activityRepository.findMany(tenantId, query);
  },

  async getById(tenantId: string, id: string) {
    const activity = await activityRepository.findById(tenantId, id);
    if (!activity) throw ApiError.notFound('Activity not found');
    return activity;
  },

  async create(tenantId: string, createdBy: string, input: CreateActivityInput) {
    const activity = await activityRepository.create(tenantId, createdBy, input);
    eventBus.emit('activity.created', {
      activityId: activity.id,
      tenantId,
      entityType: input.entityType,
      dealId: input.dealId,
      contactId: input.contactId,
      companyId: input.companyId,
    });
    return activity;
  },

  async update(tenantId: string, id: string, input: UpdateActivityInput) {
    const result = await activityRepository.update(tenantId, id, input);
    if (result.count === 0) throw ApiError.notFound('Activity not found');
    return activityRepository.findById(tenantId, id);
  },

  async complete(tenantId: string, id: string) {
    const result = await activityRepository.complete(tenantId, id);
    if (result.count === 0) throw ApiError.notFound('Activity not found');
    return activityRepository.findById(tenantId, id);
  },

  async remove(tenantId: string, id: string) {
    const result = await activityRepository.delete(tenantId, id);
    if (result.count === 0) throw ApiError.notFound('Activity not found');
  },
};