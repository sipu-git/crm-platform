import { api } from "@/api/client";
import { Assignee, CreateAssigneeInput } from "../types/assign.types";
import { Lead } from "../types/lead.types";

const subUrl = "/module-leads/assign";

export const assigneeApis = {
    assign: async (leadId: string, data: CreateAssigneeInput): Promise<Lead> => {
        const response = await api.patch<{ data: { lead: Lead } }>(`${subUrl}/${leadId}/assign`,
            data);
        return response.data.data.lead;
    },

    list: async (): Promise<Assignee[]> => {
        const response = await api.get<{ data: Assignee[] }>(subUrl);
        return response.data.data;
    },

    getById: async (id: string): Promise<Assignee> => {
        const response = await api.get<{ data: Assignee }>(`${subUrl}/${id}`);
        return response.data.data;
    },
};
