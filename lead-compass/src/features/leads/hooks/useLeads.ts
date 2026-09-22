import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { leadsKeys } from "../keys/leads.keys";
import { leadsApi } from "../apis/leads.api";
import { CreateLeadInput, Lead, LeadStatus, UpdateLeadInput } from "../types/lead.types";

let caching = {
    staleTime: 1000 * 60,
    gcTime: 5 * 60_000,
}

export function useLeads(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: filters ? leadsKeys.list(filters) : leadsKeys.lists(),
        queryFn: () => leadsApi.getAll(filters),
        placeholderData: keepPreviousData,
        ...caching
        // refetchInterval: 10000, 
        // refetchIntervalInBackground: true, 
    });
}

export function useSearchLeads(query: string) {
    return useQuery({
        queryKey: leadsKeys.search(query),
        queryFn: () => leadsApi.search(query),
        enabled: !!query,
        ...caching
    });
}

export function useLead(id?: string) {
    return useQuery({
        queryKey: id ? leadsKeys.detail(id) : leadsKeys.details(),
        queryFn: async () => {
            const lead = await leadsApi.getById(id!);
            if (lead.id !== id) {
                throw new Error(`Lead response mismatch: requested ${id}, received ${lead.id}`);
            }
            return lead;
        },
        enabled: !!id,
        ...caching,
        refetchOnMount: "always",
    });
}

export function useCreateLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLeadInput) => leadsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
        },
    });
}

export function useUpdateLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) => leadsApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: leadsKeys.detail(id) });
            const previousLead = queryClient.getQueryData<Lead>(leadsKeys.detail(id));
            if (previousLead) {
                queryClient.setQueryData<Lead>(leadsKeys.detail(id), { ...previousLead, ...data });
            }
            return { previousLead };
        },
        onError: (_err, { id }, context) => {
            if (context?.previousLead) {
                queryClient.setQueryData(leadsKeys.detail(id), context.previousLead);
            }
        },
        onSettled: (_data, _error, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
        },
    });
}

export function useUpdateLeadStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => leadsApi.updateStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: leadsKeys.detail(id) });
            const previousLead = queryClient.getQueryData<Lead>(leadsKeys.detail(id));
            if (previousLead) {
                queryClient.setQueryData<Lead>(leadsKeys.detail(id), { ...previousLead, status });
            }
            return { previousLead };
        },
        onError: (_err, { id }, context) => {
            if (context?.previousLead) {
                queryClient.setQueryData(leadsKeys.detail(id), context.previousLead);
            }
        },
        onSettled: (_data, _error, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
        },
    });
}

export function useAssignLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, assignId }: { id: string; assignId: string }) => leadsApi.assign(id, assignId),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
        }
    });
}

export function useDeleteLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => leadsApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
        }
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => leadsApi.convert(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
            // Let it invalidate users so the new client user shows up
            queryClient.invalidateQueries({ queryKey: ["users"] });
        }
    });
}
