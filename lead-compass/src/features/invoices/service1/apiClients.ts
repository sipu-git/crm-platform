// features/invoice-items/invoice-item.service.ts
import { api } from "@/api/client";
import type { InvoiceItem, CreateInvoiceItemInput, UpdateInvoiceItemInput } from "./types";

const base = (invoiceId: string) => `/invoices/${invoiceId}/items`;

export const invoiceItemApis = {
  list: (invoiceId: string) =>
    api.get<{ data: InvoiceItem[] }>(base(invoiceId)),
  getById: (invoiceId: string, itemId: string) =>
    api.get<{ data: InvoiceItem }>(`${base(invoiceId)}/${itemId}`),
  create: (invoiceId: string, data: CreateInvoiceItemInput) =>
    api.post<{ data: InvoiceItem }>(base(invoiceId), data),
  update: (invoiceId: string, itemId: string, data: UpdateInvoiceItemInput) =>
    api.patch<{ data: InvoiceItem }>(`${base(invoiceId)}/${itemId}`, data),

  remove: (invoiceId: string, itemId: string) =>
    api.delete<{ data: null }>(`${base(invoiceId)}/${itemId}`),
};