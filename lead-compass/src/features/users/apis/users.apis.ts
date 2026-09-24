import { api } from "@/api/client";
import type { Invite, InvitePayload, InviteResult, UpdateRolePayload, SearchPersonResult } from "../types";

export const userApi = {
  list: async (): Promise<Invite[]> => {
    const res = await api.get("/users");
    return res.data.data as Invite[];
  },

  invite: async (payload: InvitePayload): Promise<InviteResult> => {
    const res = await api.post("/users/invite", payload);
    return res.data.data as InviteResult;
  },

  updateRole: async ({ userId, role }: UpdateRolePayload): Promise<Invite> => {
    const res = await api.patch(`/users/${userId}/role`, { role });
    return res.data.data as Invite;
  },

  remove: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Invitation endpoints
  listInvites: async (): Promise<Invite[]> => {
    const res = await api.get("/users/invites");
    return res.data.data as Invite[];
  },

  resendInvite: async (inviteId: string): Promise<void> => {
    await api.post(`/users/invites/${inviteId}/resend`);
  },

  revokeInvite: async (inviteId: string): Promise<void> => {
    await api.delete(`/users/invites/${inviteId}`);
  },

  // Global search for invite dialog
  searchPeople: async (query: string): Promise<SearchPersonResult[]> => {
    const res = await api.get("/users/search-people", { params: { q: query } });
    return res.data.data as SearchPersonResult[];
  },
};