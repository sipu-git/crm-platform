import { api } from "@/api/client";
import type { Deal, DealBoardColumn, DealFilters, MoveDealStageInput, UpdateDealInput } from "../deal.types";
type Envelope<T> = { data: T };
const payload = <T,>(response: { data: Envelope<T> }) => response.data.data;
export const dealsApi = {
  async list(filters?: DealFilters): Promise<Deal[]> { return payload(await api.get<Envelope<Deal[]>>("/deals/deal-list", { params: filters })); },
  async board(): Promise<DealBoardColumn[]> { return payload(await api.get<Envelope<DealBoardColumn[]>>("/deals/deal-stages")); },
  async getById(id: string): Promise<Deal> { return payload(await api.get<Envelope<Deal>>(`/deals/${id}`)); },
  async update(id: string, value: UpdateDealInput): Promise<Deal> { return payload(await api.patch<Envelope<Deal>>(`/deals/${id}`, value)); },
  async moveStage(id: string, value: MoveDealStageInput): Promise<{ deal: Deal; targetStage: DealBoardColumn }> { return payload(await api.patch<Envelope<{ deal: Deal; targetStage: DealBoardColumn }>>(`/deals/${id}/move-stage`, value)); },
  async delete(id: string): Promise<void> { await api.delete(`/deals/${id}`); },
};
