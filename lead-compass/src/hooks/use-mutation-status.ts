// src/hooks/use-mutation-status.ts

import { handleApiError } from "@/lib/apiError";

type MutationStatus =
    | { type: "error"; message: string }
    | { type: "success"; message: string }
    | null;

type MutationStatusInput = {
    isError: boolean;
    isSuccess: boolean;
    error: unknown;
    successMessage?: string;
};

export function useMutationStatus({ isError, isSuccess, error, successMessage }: MutationStatusInput): MutationStatus {
    if (isError) {
        return { type: "error" as const, message: handleApiError(error) };
    }
    if (isSuccess && successMessage) {
        return { type: "success" as const, message: successMessage };
    }
    return null;
}