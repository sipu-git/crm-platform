import { dealRepository } from './deal.repository';
import { ApiError } from '../../core/utils/ApiError';
import { eventBus } from '../../core/event-bus';
import { STAGE_PROBABILITY } from './deal.schema';
import type { CreateDealInput } from './deal.schema';

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
    eventBus.emit('deal.created', { dealId: deal.id, tenantId, dealType: deal.dealType });
    return deal;
  },

  /**
   * Moves a deal to a new pipeline stage. This is the single place stage
   * transitions happen — emits deal.stage_changed always, and additionally
   * deal.won / deal.lost on terminal stages so downstream modules (invoice,
   * notification, audit) can react without this service knowing about them.
   */
  async updateStage(tenantId: string, id: string, stage: string, position?: number) {
    const probability = STAGE_PROBABILITY[stage] ?? 0;
    const result = await dealRepository.updateStage(tenantId, id, stage, probability, position);
    if (result.count === 0) throw ApiError.notFound('Deal not found');

    const deal = await dealRepository.findById(tenantId, id);

    eventBus.emit('deal.stage_changed', { dealId: id, tenantId, stage });
    if (stage === 'WON') {
      eventBus.emit('deal.won', { dealId: id, tenantId, dealType: deal?.dealType });
    } else if (stage === 'LOST') {
      eventBus.emit('deal.lost', { dealId: id, tenantId });
    }

    return deal;
  },
};
