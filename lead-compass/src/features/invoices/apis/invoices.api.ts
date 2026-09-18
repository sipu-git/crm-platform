import { api } from "@/api/client";
import { CreateInvoiceInput, Invoice, ListInvoicesQuery, UpdateInvoiceInput } from "../types/invoices.type";
import { CreateInvoiceItemInput, InvoiceItem, UpdateInvoiceItemInput } from "../types/items.types";

type Envelope<T> = { data: T };

const BASE = "/module-invoices";

const unwrap = <T,>(request: Promise<{ data: Envelope<T> }>) =>
  request.then((response) => response.data.data);

export const invoiceApi = {
  list: (filters: ListInvoicesQuery = {}) =>
    unwrap(
      api.get<Envelope<Invoice[]>>(`${BASE}/invoice`, {
        params: filters,
      }),
    ),

  listOwn: () => unwrap(api.get<Envelope<Invoice[]>>(`${BASE}/invoice/view-own-invoice`)),

  getById: (id: string) =>
    unwrap(api.get<Envelope<Invoice>>(`${BASE}/invoice/${id}`)),

  getOwnById: (id: string) => unwrap(api.get<Envelope<Invoice>>(`${BASE}/invoice/view-own-invoice/${id}`)),

  create: (value: CreateInvoiceInput) =>
    unwrap(api.post<Envelope<Invoice>>(`${BASE}/invoice`, value)),

  update: (id: string, value: UpdateInvoiceInput) =>
    unwrap(
      api.patch<Envelope<Invoice>>(
        `${BASE}/invoice/${id}/modify-invoice`,
        value,
      ),
    ),

  markPaid: (id: string) =>
    unwrap(
      api.patch<Envelope<Invoice>>(`${BASE}/invoice/${id}/mark-paid`),
    ),

  delete: async (id: string) => {
    await api.delete(`${BASE}/invoice/${id}`);
  },

  items: (invoiceId: string) =>
    unwrap(
      api.get<Envelope<InvoiceItem[]>>(`${BASE}/${invoiceId}/items`),
    ),

  createItem: (invoiceId: string, value: CreateInvoiceItemInput) =>
    unwrap(
      api.post<Envelope<InvoiceItem>>(
        `${BASE}/${invoiceId}/items`,
        value,
      ),
    ),

  updateItem: (invoiceId: string, itemId: string, value: UpdateInvoiceItemInput) =>
    unwrap(
      api.patch<Envelope<InvoiceItem>>(
        `${BASE}/${invoiceId}/items/${itemId}`,
        value,
      ),
    ),

  deleteItem: async (invoiceId: string, itemId: string) => {
    await api.delete(`${BASE}/${invoiceId}/items/${itemId}`);
  },
};
