import { activityRepository } from './activity.repository';
import { eventBus } from '../../core/event-bus';
import type { CreateActivityInput } from './activity.schema';

export const activityService = {
  list(tenantId: string, entityType: string, entityId: string) {
    return activityRepository.findByEntity(tenantId, entityType, entityId);
  },

  async create(tenantId: string, createdBy: string, input: CreateActivityInput) {
    const activity = await activityRepository.create(tenantId, createdBy, input);
    eventBus.emit('activity.created', { activityId: activity.id, tenantId, entityType: input.entityType, entityId: input.entityId });
    return activity;
  },
};
