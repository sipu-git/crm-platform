import { api } from "@/api/client";
import type { CreateEnquiryInput, Enquiry } from "../types/enquiry.types";

const subUrl = "/enquiry";

type EnquiryApprovalResult = { id: string };

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

  approve: async (id: string): Promise<EnquiryApprovalResult> => {
    const response = await api.patch<{ data: EnquiryApprovalResult }>(`${subUrl}/approve/${id}`);
    return response.data.data;
  },

  reject: async (id: string): Promise<Enquiry> => {
    const response = await api.patch<{ data: Enquiry }>(`${subUrl}/reject/${id}`);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${subUrl}/${id}`);
  },
};
