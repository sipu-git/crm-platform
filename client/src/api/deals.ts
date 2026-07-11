import { apiClient } from "./client";
import type { Deal, DealInput } from "@/entities";

export const dealsApi = {
  list: () => apiClient.get<Deal[]>("/deals"),
  get: (id: string) => apiClient.get<Deal>(`/deals/${id}`),
  create: (input: DealInput) => apiClient.post<Deal>("/deals", input),
  update: (id: string, input: Partial<DealInput>) =>
    apiClient.patch<Deal>(`/deals/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/deals/${id}`),
};
