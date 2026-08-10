// leads.service.ts

import { api } from "@/api/client";
import { Lead } from "./lead.types";

const subUrl = "/leads";

export const leadApis = {
    addLead: (data: any) => api.post(`${subUrl}`, data),
    viewLeads: () => api.get(`${subUrl}`),
    viewLead: (leadId: string) => api.get(`${subUrl}/${leadId}`),
    updateLeadStatus: (leadId: string, data: any) =>
        api.patch(`${subUrl}/${leadId}/status`, data),
    updateLead: (leadId: string, data: Partial<Lead>) =>
        api.patch(`${subUrl}/modify-lead/${leadId}`, data),
    deleteLead: (leadId: string) => api.delete(`${subUrl}/delete-lead/${leadId}`),
    removeAllLeads: () => api.delete(`${subUrl}/delete-all-leads`),
    assign: (leadId: string, assignId: string) =>
        api.patch(`${subUrl}/${leadId}/assign`, { assignId }),

    filterLeads: (filter: "day" | "month" | "year" = "month", groupId?: string) =>
        api.get(`${subUrl}/filter-lead`, { params: { filter, ...(groupId ? { groupId } : {}) } }),
};