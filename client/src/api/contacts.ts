import { apiClient } from "./client";
import type { Contact, ContactInput } from "@/entities";

export const contactsApi = {
  list: () => apiClient.get<Contact[]>("/contacts"),
  get: (id: string) => apiClient.get<Contact>(`/contacts/${id}`),
  create: (input: ContactInput) => apiClient.post<Contact>("/contacts", input),
  update: (id: string, input: Partial<ContactInput>) =>
    apiClient.patch<Contact>(`/contacts/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/contacts/${id}`),
};
