// deal.api.ts
import { api } from "@/api/client";
import type {
    Deal,
    DealBoardColumn,
    MoveDealStageInput,
    UpdateDealInput,
} from "@/features/deals/deal.types";

interface ApiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
}

const subUrl = "/deals";

export const dealApis = {
    list: (params?: { stageId?: string; ownerId?: string }) =>api.get<ApiEnvelope<Deal[]>>(`${subUrl}/deal-list`, { params }),
    board: () => api.get<ApiEnvelope<DealBoardColumn[]>>(`${subUrl}/deal-stages`),
    getById: (id: string) => api.get<ApiEnvelope<Deal>>(`${subUrl}/${id}`),
    update: (id: string, data: UpdateDealInput) =>
        api.patch<ApiEnvelope<Deal>>(`${subUrl}/${id}`, data),
    moveStage: (id: string, data: MoveDealStageInput) =>
        api.patch<ApiEnvelope<{ deal: Deal; targetStage: DealBoardColumn }>>(
            `${subUrl}/${id}/move-stage`,
            data
        ),
    remove: (id: string) => api.delete<ApiEnvelope<null>>(`${subUrl}/${id}`),
};