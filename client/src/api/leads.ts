import { apiClient } from "./client";
import type { Lead, LeadInput } from "@/entities";

export const leadsApi = {
  list: () => apiClient.get<Lead[]>("/leads"),
  get: (id: string) => apiClient.get<Lead>(`/leads/${id}`),
  create: (input: LeadInput) => apiClient.post<Lead>("/leads", input),
  update: (id: string, input: Partial<LeadInput>) =>
    apiClient.patch<Lead>(`/leads/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/leads/${id}`),
};
