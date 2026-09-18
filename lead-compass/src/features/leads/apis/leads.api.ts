import { api } from "@/api/client";
import { Lead, CreateLeadInput, UpdateLeadInput, LeadStatus } from "../types/lead.types";

const subUrl = "/module-leads/lead";

export const leadsApi = {
    getAll: async (filters?: Record<string, unknown>): Promise<Lead[]> => {
        const response = await api.get<{ data: Lead[] }>(subUrl, { params: filters });
        return response.data.data;
    },
    
    getById: async (id: string): Promise<Lead> => {
        const response = await api.get<{ data: Lead }>(`${subUrl}/${id}`);
        return response.data.data;
    },

    create: async (data: CreateLeadInput): Promise<Lead> => {
        const response = await api.post<{ data: Lead }>(subUrl, data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateLeadInput): Promise<Lead> => {
        const response = await api.patch<{ data: Lead }>(`${subUrl}/modify-lead/${id}`, data);
        return response.data.data;
    },

    updateStatus: async (id: string, status: LeadStatus): Promise<Lead> => {
        const response = await api.patch<{ data: Lead }>(`${subUrl}/${id}/status`, { status });
        return response.data.data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`${subUrl}/delete-lead/${id}`);
    },
    
    assign: async (leadId: string, assignId: string): Promise<Lead> => {
        const response = await api.patch<{ data: Lead }>(`${subUrl}/${leadId}/assign`, { assignId });
        return response.data.data;
    },
    search: async (query: string): Promise<Lead[]> => {
        const response = await api.get<{ data: Lead[] }>(`${subUrl}/search-lead`, { params: { query } });
        return response.data.data;
    },
    convert: async (id: string): Promise<{ lead: Lead; clientUser: any; isNewClient: boolean }> => {
        const response = await api.post<{ data: { lead: Lead; clientUser: any; isNewClient: boolean } }>(`${subUrl}/${id}/convert`);
        return response.data.data;
    }
};

