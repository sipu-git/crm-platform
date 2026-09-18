import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoicesKeys } from "../keys/invoices.keys";
import type { CreateInvoiceInput, Invoice, ListInvoicesQuery, UpdateInvoiceInput } from "../types/invoices.type";
import type { CreateInvoiceItemInput, UpdateInvoiceItemInput } from "../types/items.types";
import { invoiceApi } from "../apis/invoices.api";
import { useAuthPayload } from "@/features/auth/hooks/useAuthPayload";

const cache = {
  staleTime: 1000 * 60,
  // refetchInterval: 10000,
  // refetchIntervalInBackground: true
};

export function useInvoices(filters?: ListInvoicesQuery) {
  const auth = useAuthPayload()
  const role = auth?.user.role;

  return useQuery({
    queryKey: filters ? invoicesKeys.list(filters) : invoicesKeys.lists(),
    ...cache, queryFn: () => role === "CLIENT" ? invoiceApi.listOwn() : invoiceApi.list(filters),

  });
}

export function useInvoiceById(id: string) {
  const auth = useAuthPayload()
  const role = auth?.user.role;

  return useQuery({
    queryKey: invoicesKeys.detail(id),
    queryFn: () => role === "CLIENT" ? invoiceApi.getOwnById(id) : invoiceApi.getById(id),
    enabled: !!id,
    ...cache,
  });
}

export function useInvoiceItems(invoiceId: string) {
  return useQuery({
    queryKey: invoicesKeys.items(invoiceId),
    queryFn: () => invoiceApi.items(invoiceId),
    enabled: !!invoiceId,
    ...cache,
  });
}

export function useInvoiceMutation() {
  const qc = useQueryClient();

  const refresh = () =>
    qc.invalidateQueries({ queryKey: invoicesKeys.lists() });

  const patch = (invoice: Invoice) =>
    qc.setQueryData(invoicesKeys.detail(invoice.id), invoice);

  return {
    create: useMutation({
      mutationFn: (value: CreateInvoiceInput) => invoiceApi.create(value),
      onSuccess: (invoice) => {
        patch(invoice);
        return refresh();
      },
    }),

    update: useMutation({
      mutationFn: ({ id, value }: { id: string; value: UpdateInvoiceInput }) =>
        invoiceApi.update(id, value),
      onSuccess: (invoice) => {
        patch(invoice);
        return refresh();
      },
    }),

    markPaid: useMutation({
      mutationFn: invoiceApi.markPaid,
      onSuccess: (invoice) => {
        patch(invoice);
        return refresh();
      },
    }),

    delete: useMutation({
      mutationFn: invoiceApi.delete,
      onSuccess: (_, id) => {
        qc.removeQueries({ queryKey: invoicesKeys.detail(id) });
        return refresh();
      },
    }),

    createItem: useMutation({
      mutationFn: ({
        invoiceId,
        value,
      }: {
        invoiceId: string;
        value: CreateInvoiceItemInput;
      }) => invoiceApi.createItem(invoiceId, value),
      onSuccess: (_, { invoiceId }) =>
        qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) }),
    }),

    updateItem: useMutation({
      mutationFn: ({
        invoiceId,
        itemId,
        value,
      }: {
        invoiceId: string;
        itemId: string;
        value: UpdateInvoiceItemInput;
      }) => invoiceApi.updateItem(invoiceId, itemId, value),
      onSuccess: (_, { invoiceId }) =>
        qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) }),
    }),

    deleteItem: useMutation({
      mutationFn: ({
        invoiceId,
        itemId,
      }: {
        invoiceId: string;
        itemId: string;
      }) => invoiceApi.deleteItem(invoiceId, itemId),
      onSuccess: (_, { invoiceId }) =>
        qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) }),
    }),
  };
}
