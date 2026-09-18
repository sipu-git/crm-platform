import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "../apis/contacts.api";
import { contactsKeys } from "../keys/contacts.keys";
import type { CreateContactInput, UpdateContact } from "../contact.types";

const cache = {
  staleTime: 5 * 60_000,
  gcTime: 15 * 60_000,
};

export function useContacts(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: filters ? contactsKeys.list(filters) : contactsKeys.lists(),
    queryFn: () => contactsApi.list(filters),
    ...cache,
  });
}

export function useContactById(id: string) {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
    ...cache,
  });
}

export function useContactMutation() {
  const queryClient = useQueryClient();

  const refresh = (id?: string) => {
    if (id) queryClient.invalidateQueries({ queryKey: contactsKeys.detail(id) });
    return queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
  };

  return {
    create: useMutation({
      mutationFn: (data: CreateContactInput) => contactsApi.create(data),
      onSuccess: () => refresh(),
    }),

    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateContact }) =>
        contactsApi.update(id, data),
      onSuccess: (contact) => {
        queryClient.setQueryData(contactsKeys.detail(contact.id), contact);
        return refresh();
      },
    }),

    delete: useMutation({
      mutationFn: contactsApi.delete,
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: contactsKeys.detail(id) });
        return refresh();
      },
    }),
  };
}