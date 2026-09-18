// src/features/auth/hooks/useCurrentUser.ts
import { useAuth } from "./useAuth";

export function useCurrentUser() {
    const { data, isLoading, error } = useAuth();   // data?.user is the user object
    return {
        user: data?.user,
        isLoading,
        error,
    };
}