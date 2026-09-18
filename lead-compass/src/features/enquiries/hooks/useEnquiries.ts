import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enquiriesKeys } from "../keys/enquiries.keys";
import { enquiriesApi } from "../apis/enquiries.api";
import type { CreateEnquiryInput, Enquiry, EnquiryApprovalInput, UpdateEnquiryInput } from "../types/enquiry.types";
import { leadsKeys } from "@/features/leads/keys/leads.keys";
import { contactsKeys } from "@/features/contacts/keys/contacts.keys";
import { companiesKeys } from "@/features/companies/keys/companies.keys";

export function useEnquiries() {
  return useQuery({
    queryKey: enquiriesKeys.lists(),
    queryFn: enquiriesApi.getAll,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useEnquiry(id?: string) {
  return useQuery({
    queryKey: enquiriesKeys.detail(id ?? "new"),
    queryFn: () => id ? enquiriesApi.getById(id) : Promise.reject(new Error("missing id")),
    enabled: Boolean(id),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEnquiryInput) => enquiriesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiriesKeys.lists() });
    },
  });
}

export function useApproveEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EnquiryApprovalInput }) => enquiriesApi.approve(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: enquiriesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: enquiriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.list() });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.list() });
    },
  });
}

export function useRejectEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EnquiryApprovalInput }) => enquiriesApi.reject(id, input),
    onSuccess: (updatedEnquiry, { id }) => {
      queryClient.setQueryData<Enquiry>(enquiriesKeys.detail(id), (current) =>
        current ? { ...current, ...updatedEnquiry, enquiryStatus: "REJECTED" } : updatedEnquiry,
      );

      queryClient.setQueryData<Enquiry[]>(enquiriesKeys.lists(), (current = []) =>
        current.map((row) => row.id === id ? { ...row, ...updatedEnquiry, enquiryStatus: "REJECTED" } : row),
      );

      queryClient.invalidateQueries({ queryKey: enquiriesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: enquiriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.list() });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.list() });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enquiriesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Enquiry[]>(enquiriesKeys.lists(), (current = []) =>
        current.filter((row) => row.id !== id),
      );

      queryClient.removeQueries({ queryKey: enquiriesKeys.detail(id), exact: true });

      queryClient.invalidateQueries({ queryKey: enquiriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.list() });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list() });
      queryClient.invalidateQueries({ queryKey: companiesKeys.list() });
    },
  });
}
