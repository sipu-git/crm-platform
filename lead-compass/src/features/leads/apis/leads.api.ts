import { api } from "@/api/client";
import { Lead, CreateLeadInput, UpdateLeadInput, LeadStatus, LeadListMeta, LeadListResponse } from "../types/lead.types";

const subUrl = "/module-leads/lead";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

function isLeadListMeta(value: unknown): value is LeadListMeta {
    return isRecord(value)
        && typeof value.total === "number"
        && typeof value.page === "number"
        && typeof value.limit === "number"
        && typeof value.totalPages === "number"
        && typeof value.hasNextPage === "boolean"
        && typeof value.hasPrevPage === "boolean";
}

function parseLeadListResponse(payload: unknown): LeadListResponse {
    if (Array.isArray(payload)) return { data: payload as Lead[] };
    if (!isRecord(payload)) throw new Error("Invalid leads list response");

    // The API returns { success, message, data: { data: Lead[], meta } }.
    const result = payload.data;
    if (isRecord(result) && Array.isArray(result.data)) {
        return {
            data: result.data as Lead[],
            meta: isLeadListMeta(result.meta) ? result.meta : undefined,
        };
    }

    // Also accept an unwrapped paginated response or legacy success envelope.
    if (Array.isArray(result)) {
        return {
            data: result as Lead[],
            meta: isLeadListMeta(payload.meta) ? payload.meta : undefined,
        };
    }

    throw new Error("Invalid leads list response");
}

export const leadsApi = {
    getAll: async (filters?: Record<string, unknown>): Promise<LeadListResponse> => {
        const response = await api.get<unknown>(subUrl, { params: filters });
        return parseLeadListResponse(response.data);
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
        const response = await api.get<unknown>(`${subUrl}/search-lead`, { params: { query } });
        return parseLeadListResponse(response.data).data;
    },
    convert: async (id: string): Promise<{ lead: Lead; clientUser: any; isNewClient: boolean }> => {
        const response = await api.post<{ data: { lead: Lead; clientUser: any; isNewClient: boolean } }>(`${subUrl}/${id}/convert`);
        return response.data.data;
    }
};
