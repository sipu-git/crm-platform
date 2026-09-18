import { api } from "@/api/client";
import { SendGmailPayload } from "./communication.types";

const subUrl = "/communications";
export const communicationApis = {
    addCommunication: (data: any, leadId: string) => api.post(`${subUrl}/${leadId}/send`, data),
    viewCommunications: (leadId: string) => api.get(`${subUrl}/${leadId}/view-chats`),

    getGmailStatus: () => api.get(`${subUrl}/gmail/status`),
    getGmailAccounts: () => api.get(`${subUrl}/gmail/accounts`),
    disconnectGmailAccount: (accountId: string) => api.delete(`${subUrl}/gmail/accounts/${accountId}`),
    getGmailInbox: (limit = 20) => api.get(`${subUrl}/gmail/inbox?limit=${limit}`),
    syncGmailMessages: () => api.post(`${subUrl}/gmail/sync`),
    sendGmailDirect: (data: SendGmailPayload) => api.post(`${subUrl}/gmail/send`, data),
    getGmailConnectUrl: (returnTo?: string) =>
        api.get(`${subUrl}/gmail/connect`, { params: returnTo ? { returnTo } : undefined }),
};