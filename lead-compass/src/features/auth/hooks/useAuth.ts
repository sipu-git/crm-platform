// src/features/auth/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../apis/auth.api";
import { authKeys } from "../keys/auth.keys";

import { useAppDispatch } from "@/store/hooks";
import type { AuthResult, LoginPayload } from "../types/auth.types";

export function useAuth() {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: () => authApi.refresh({ refreshToken: getRefreshToken() }).then(r => r.data),
        staleTime: Infinity,
        gcTime: 15 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    });
}


export function useLogin() {
    const qc = useQueryClient();
    return useMutation<AuthResult, Error, LoginPayload>({
        mutationFn: (payload: LoginPayload) => authApi.login(payload).then(r => r.data),
        mutationKey: authKeys.login,
        onSuccess: (result) => {
            localStorage.setItem('crm.auth.token', result.accessToken);
            localStorage.setItem('crm.auth.refresh_token', result.refreshToken ?? "");
            qc.setQueryData(authKeys.me, result)
        },
    });
}

export function useLogout() {
    const dispatch = useAppDispatch();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        mutationKey: authKeys.logout,
        onSuccess: () => {
            // Clear everything manually
            localStorage.removeItem('crm.auth.token');
            localStorage.removeItem('crm.auth.refresh_token');
            localStorage.removeItem('crm.tenant.slug');
            qc.clear();
        },
    });
}

/* ---------- USERS ---------- */
export function useUsers() {
    return useQuery({
        queryKey: authKeys.users,
        queryFn: () => authApi.listUsers().then(r => r.data),
        staleTime: 5 * 60_000,
    });
}

/* ---------- Helper ---------- */
function getRefreshToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("crm.auth.refresh_token") : null;
}