import { api } from "@/api/client";

const subUrl = "/communications";

export const communicationApis = {
    addCommunication: (data: any, leadId: string) => api.post(`${subUrl}/${leadId}/send`, data),
    viewCommunications: (leadId: string) => api.get(`${subUrl}/${leadId}/view-chats`),
};