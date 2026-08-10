import { api } from "@/api/client";
import { Assignee, CreateAssigneeInput } from "./assign.types";

const sub_url = "/leads/assign";

export const assigneeApis = {
    create: (data: CreateAssigneeInput) => api.post<{ data: Assignee }>(`${sub_url}/create-assign`, data),
    list: () => api.get<{ data: Assignee[] }>(sub_url),
    getById: (id: string) =>
        api.get<{ data: Assignee }>(`${sub_url}/${id}`),
};