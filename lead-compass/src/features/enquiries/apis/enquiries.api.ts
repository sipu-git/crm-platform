import { api } from "@/api/client";
import type { CreateEnquiryInput, Enquiry, EnquiryApprovalInput, UpdateEnquiryInput } from "../types/enquiry.types";

const subUrl = "/enquiry";

export const enquiriesApi = {
  getAll: async (): Promise<Enquiry[]> => {
    const response = await api.get<{ data: Enquiry[] }>(subUrl);
    return response.data.data;
  },

  getById: async (id: string): Promise<Enquiry> => {
    const response = await api.get<{ data: Enquiry }>(`${subUrl}/${id}`);
    return response.data.data;
  },

  create: async (input: CreateEnquiryInput): Promise<Enquiry> => {
    const response = await api.post<{ data: Enquiry }>(subUrl, input);
    return response.data.data;
  },

  approve: async (id: string, input: EnquiryApprovalInput): Promise<Enquiry> => {
    const response = await api.patch<{ data: Enquiry }>(`${subUrl}/approve/${id}`, input);
    return response.data.data;
  },

 reject: async (id: string, input: EnquiryApprovalInput): Promise<Enquiry> => {
    const response = await api.patch<{ data: Enquiry }>(`${subUrl}/reject/${id}`, input);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${subUrl}/${id}`);
  },
};
