
import { api } from "@/api/client";
import type { Activity, CreateActivityInput, ListActivitiesQuery, UpdateActivityInput } from "../types";
type Envelope<T> = { data: T };
const payload = <T,>(response: { data: Envelope<T> }) => response.data.data;

export const activitiesApi = {
  async list(filters: ListActivitiesQuery = {}): Promise<Activity[]> {
    return payload(await api.get<Envelope<Activity[]>>("/activities", { params: filters }));
  },
  async getOwnActivity(): Promise<Activity[]> {
    return payload(await api.get<Envelope<Activity[]>>(`/activities/view-activity`));
  },
  async create(value: CreateActivityInput): Promise<Activity> {
    return payload(await api.post<Envelope<Activity>>("/activities", value));
  },
  async update(id: string, value: UpdateActivityInput): Promise<Activity> {
    return payload(await api.patch<Envelope<Activity>>(`/activities/${id}`, value));
  },
  async complete(id: string): Promise<Activity> {
    return payload(await api.post<Envelope<Activity>>(`/activities/${id}/complete`));
  },
  async delete(id: string): Promise<void> { await api.delete(`/activities/${id}`); },
};
