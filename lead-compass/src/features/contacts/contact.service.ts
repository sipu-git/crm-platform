// src/features/contacts/contacts.api.ts
import { api } from "@/api/client";
import type { Contact, UpdateContact } from "@/features/contacts/contact.types";

const subUrl = "/contacts";

export const contactApis = {
  list: (search?: string) => api.get<Contact[]>(subUrl, { params: search ? { search } : undefined }),
  getById: (id: string) => api.get<Contact>(`${subUrl}/${id}`),
  update: (id: string, data: any) => api.patch<Contact>(`${subUrl}/${id}`, data),
  remove: (id: string) => api.delete(`${subUrl}/${id}`),
};