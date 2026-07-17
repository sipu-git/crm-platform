import { eventBus } from '../../shared/event-bus';
import { ApiError } from '../../shared/utils/ApiError';
import { STAGE_PROBABILITY } from './deal.constant';
import { dealRepository } from './deal.repository';
import type { CreateDealInput } from './deal.schema';
import { pipelineRepository } from './pipeline.repository';

export const dealService = {
  list(tenantId: string, ownerId?: string) {
    return dealRepository.findMany(tenantId, ownerId);
  },

  async getById(tenantId: string, id: string) {
    const deal = await dealRepository.findById(tenantId, id);
    if (!deal) throw ApiError.notFound('Deal not found');
    return deal;
  },

  async create(tenantId: string, ownerId: string, input: CreateDealInput) {
    const deal = await dealRepository.create(tenantId, ownerId, input);
    eventBus.emit('deal.created', { dealId: deal.id, tenantId });
    return deal;
  },

  async updateStage(tenantId: string, id: string, stageId: string, position?: number) {
    const pipeline = await pipelineRepository.findById(tenantId, stageId);
    if (!pipeline) throw ApiError.notFound('Pipeline stage not found');

    const probability = STAGE_PROBABILITY[pipeline.name] ?? 0;
    const result = await dealRepository.updateStage(tenantId, id, stageId, probability, position);
    if (result.count === 0) throw ApiError.notFound('Deal not found');

    const deal = await dealRepository.findById(tenantId, id);

    eventBus.emit('deal.stage_changed', { dealId: id, tenantId, stageId });
    if (pipeline.is_own) {
      eventBus.emit('deal.won', { dealId: id, tenantId });
    } else if (pipeline.is_lost) {
      eventBus.emit('deal.lost', { dealId: id, tenantId });
    }
    return deal;
  },
};
