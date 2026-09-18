// features/users/hooks/useUsers.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InvitePayload, UpdateRolePayload } from "../types";
import { usersKeys } from "../keys/user.keys";
import { userApi } from "../apis/users.apis";

const cache = { staleTime: 1000 * 60 };

export function useUsers(options?: { enabled: boolean }) {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: userApi.list,
    ...cache,
    enabled: options?.enabled ?? true,
  });
}

export function useInvites(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usersKeys.invites(),
    queryFn: userApi.listInvites,
    ...cache,
    enabled: options?.enabled ?? true,
  });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const refreshMembers = () => qc.invalidateQueries({ queryKey: usersKeys.lists() });
  const refreshInvites = () => qc.invalidateQueries({ queryKey: usersKeys.invites() });

  return {
    invite: useMutation({
      mutationFn: (payload: InvitePayload) => userApi.invite(payload),
      onSuccess: () => {
        refreshMembers();
        refreshInvites();
      },
    }),
    updateRole: useMutation({
      mutationFn: (payload: UpdateRolePayload) => userApi.updateRole(payload),
      onSuccess: refreshMembers,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => userApi.remove(userId),
      onSuccess: refreshMembers,
    }),
    resendInvite: useMutation({
      mutationFn: (inviteId: string) => userApi.resendInvite(inviteId),
      onSuccess: refreshInvites,
    }),
    revokeInvite: useMutation({
      mutationFn: (inviteId: string) => userApi.revokeInvite(inviteId),
      onSuccess: refreshInvites,
    }),
  };
}