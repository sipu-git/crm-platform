import { api } from "@/api/client";
import type { Invoice, CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from "./types";

const sub_url = "/invoices/main";

export const invoiceApis = {
  list: (query: ListInvoicesQuery = {}) =>
    api.get<{ data: Invoice[] }>(sub_url, { params: query }),

  getById: (id: string) =>
    api.get<{ data: Invoice }>(`${sub_url}/${id}`),

  create: (data: CreateInvoiceInput) =>
    api.post<{ data: Invoice }>(sub_url, data),

  update: (id: string, data: UpdateInvoiceInput) =>
    api.patch<{ data: Invoice }>(`${sub_url}/${id}/modify-invoice`, data),

  markPaid: (id: string) =>
    api.patch<{ data: Invoice }>(`${sub_url}/${id}/mark-paid`),

  remove: (id: string) =>
    api.delete<{ data: null }>(`${sub_url}/${id}`),
};