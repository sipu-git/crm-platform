import { api } from "@/api/client";
import type { Contact, CreateContactInput, UpdateContact } from "../contact.types";

const endpoint = "/contacts";
export const contactsApi = {
  async list(filters?: Record<string, unknown>): Promise<Contact[]> {
    return (await api.get<Contact[]>(endpoint, { params: filters })).data;
  },
  async getById(id: string): Promise<Contact> { return (await api.get<Contact>(`${endpoint}/${id}`)).data; },
  async create(data: CreateContactInput): Promise<Contact> { return (await api.post<Contact>(endpoint, data)).data; },
  async update(id: string, data: UpdateContact): Promise<Contact> { return (await api.patch<Contact>(`${endpoint}/${id}`, data)).data; },
  async delete(id: string): Promise<void> { await api.delete(`${endpoint}/${id}`); },
};
