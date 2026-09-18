import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { assigneeApis } from "../apis/assign.api";

import { assignmentKeys } from "../keys/assignment.keys";
import { leadsKeys } from "../keys/leads.keys";

import { CreateAssigneeInput } from "../types/assign.types";
import { Lead } from "../types/lead.types";

export function useAssignment() {
    return useQuery({
        queryKey: assignmentKeys.lists(),
        queryFn: assigneeApis.list,
        staleTime: 5 * 60_000,
        gcTime: 15 * 60_000,
        refetchOnMount: "always",
    });
}

export function useAssignmentById(id: string) {
    return useQuery({
        queryKey: assignmentKeys.detail(id),
        queryFn: () => assigneeApis.getById(id),
        enabled: !!id,
        staleTime: 5 * 60_000,
        gcTime: 15 * 60_000,
    });
}

export function useAssign() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, data, }: {
            leadId: string; data: CreateAssigneeInput;
        }) => assigneeApis.assign(leadId, data),

        onSuccess: (updatedLead, { leadId }) => {
            // The endpoint returns the updated lead wrapped as { lead }, not an assignee.
            // Replacing the detail cache prevents a mismatched assignee object from rendering.
            queryClient.setQueryData<Lead>(leadsKeys.detail(leadId), updatedLead);
            queryClient.invalidateQueries({
                queryKey: assignmentKeys.lists(),
            });

            queryClient.invalidateQueries({
                queryKey: leadsKeys.detail(leadId),
            });

            queryClient.invalidateQueries({
                queryKey: leadsKeys.lists(),
            });
        },
    });
}
