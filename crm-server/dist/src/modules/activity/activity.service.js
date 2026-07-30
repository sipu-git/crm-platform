import { ApiError } from '../../shared/utils/ApiError.js';
import { eventBus } from '../../shared/event-bus.js';
import { activityRepository } from './activity.repository.js';
export const activityService = {
    list(tenantId, query = {}) {
        return activityRepository.findMany(tenantId, query);
    },
    async getById(tenantId, id) {
        const activity = await activityRepository.findById(tenantId, id);
        if (!activity)
            throw ApiError.notFound('Activity not found');
        return activity;
    },
    async create(tenantId, createdBy, input) {
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
    async update(tenantId, id, input) {
        const result = await activityRepository.update(tenantId, id, input);
        if (result.count === 0)
            throw ApiError.notFound('Activity not found');
        return activityRepository.findById(tenantId, id);
    },
    async complete(tenantId, id) {
        const result = await activityRepository.complete(tenantId, id);
        if (result.count === 0)
            throw ApiError.notFound('Activity not found');
        return activityRepository.findById(tenantId, id);
    },
    async remove(tenantId, id) {
        const result = await activityRepository.delete(tenantId, id);
        if (result.count === 0)
            throw ApiError.notFound('Activity not found');
    },
};
