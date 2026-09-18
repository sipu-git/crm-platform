import { useQueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@/features/auth/types/auth.types';

/**
 * Hook to retrieve the current auth payload (access token, user info, permissions)
 * directly from the React‑Query cache.
 *
 * It returns the same shape as {@link AuthResult} that is stored under the
 * `['auth', 'me']` query key by the `useAuth` hook. If the query has not been
 * fetched yet, `undefined` is returned.
 */
export const useAuthPayload = (): AuthResult | undefined => {
  const queryClient = useQueryClient();
  // The cache entry has the type `AuthResult` (or undefined before the first fetch)
  return queryClient.getQueryData<AuthResult>(['auth', 'me']);
};

