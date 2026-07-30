import { dealService } from './deal.service';
import { createDealSchema, updateStageSchema } from './deal.schema';
import { ApiError } from '../../shared/utils/ApiError';
function getId(req) {
    const { id } = req.params;
    if (typeof id !== 'string')
        throw ApiError.notFound('deal not found');
    return id;
}
export const dealController = {
    async list(req, res) {
        const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
        const deals = await dealService.list(req.tenantId, ownerId);
        res.json(deals);
    },
    async getById(req, res) {
        const deal = await dealService.getById(req.tenantId, getId(req));
        res.json(deal);
    },
    async create(req, res) {
        const input = createDealSchema.parse(req.body);
        const deal = await dealService.create(req.tenantId, req.auth.userId, input);
        res.status(201).json(deal);
    },
    async updateStage(req, res) {
        const parsed = updateStageSchema.safeParse(req.body);
        if (!parsed.success) {
            throw ApiError.badRequest('Invalid request body', parsed.error.flatten());
        }
        const { stageId, position } = parsed.data;
        const deal = await dealService.updateStage(req.tenantId, getId(req), stageId, position);
        res.json(deal);
    },
};
