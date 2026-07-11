import { apiClient } from "./client";
import type { Invoice, InvoiceInput } from "@/entities";

export const invoicesApi = {
  list: () => apiClient.get<Invoice[]>("/invoices"),
  get: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`),
  create: (input: InvoiceInput) => apiClient.post<Invoice>("/invoices", input),
  update: (id: string, input: Partial<InvoiceInput>) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/invoices/${id}`),
};
