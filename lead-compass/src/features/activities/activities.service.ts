// features/activities/activity.service.ts
import { api } from "@/api/client";
import { Activity, CreateActivityInput, ListActivitiesQuery, UpdateActivityInput } from "./types";

const sub_url = "/activities";

export const activityApis = {
    list: (query: ListActivitiesQuery = {}) =>
        api.get<{ data: Activity[] }>(sub_url, { params: query }),

    getById: (id: string) =>
        api.get<{ data: Activity }>(`${sub_url}/${id}`),

    create: (data: CreateActivityInput) =>
        api.post<{ data: Activity }>(sub_url, data),

    update: (id: string, data: UpdateActivityInput) =>
        api.patch<{ data: Activity }>(`${sub_url}/${id}`, data),

    complete: (id: string) =>
        api.post<{ data: Activity }>(`${sub_url}/${id}/complete`),

    remove: (id: string) =>
        api.delete<{ data: null }>(`${sub_url}/${id}`),
};