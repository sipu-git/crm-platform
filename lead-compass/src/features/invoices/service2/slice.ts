import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Invoice, InvoiceStates, CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from "./types";
import { invoiceApis } from "./apiClients";
import type { RootState } from "@/store";
import { handleApiError } from "@/lib/apiError";

const initialState: InvoiceStates = {
  invoices: null,
  invoiceDetail: null,
  loading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk(
  "invoices/fetch",
  async (query: ListInvoicesQuery = {}, { rejectWithValue }) => {
    try {
      const res = await invoiceApis.list(query);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  "invoices/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await invoiceApis.getById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (data: CreateInvoiceInput, { rejectWithValue }) => {
    try {
      const res = await invoiceApis.create(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async ({ id, changes }: { id: string; changes: UpdateInvoiceInput }, { rejectWithValue }) => {
    try {
      const res = await invoiceApis.update(id, changes);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const markInvoicePaid = createAsyncThunk(
  "invoices/markPaid",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await invoiceApis.markPaid(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  "invoices/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await invoiceApis.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const slice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    clearInvoiceDetail(state) {
      state.invoiceDetail = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchInvoices.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchInvoices.fulfilled, (s, a) => {
      s.loading = false;
      s.invoices = a.payload;
    });
    b.addCase(fetchInvoices.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Could not load invoices";
    });

    b.addCase(fetchInvoice.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchInvoice.fulfilled, (s, a) => {
      s.loading = false;
      s.invoiceDetail = a.payload;
    });
    b.addCase(fetchInvoice.rejected, (s, a) => {
      s.loading = false;
      s.error = (a.payload as string) || "Could not load invoice";
    });

    b.addCase(createInvoice.fulfilled, (s, a: PayloadAction<Invoice>) => {
      s.invoices = s.invoices ? [a.payload, ...s.invoices] : [a.payload];
      s.invoiceDetail = a.payload;
    });
    b.addCase(createInvoice.rejected, (s, a) => {
      s.error = (a.payload as string) || "Could not create invoice";
    });

    b.addCase(updateInvoice.fulfilled, (s, a: PayloadAction<Invoice>) => {
      s.invoiceDetail = a.payload;
      const idx = s.invoices?.findIndex((i) => i.id === a.payload.id) ?? -1;
      if (s.invoices && idx !== -1) s.invoices[idx] = a.payload;
    });
    b.addCase(updateInvoice.rejected, (s, a) => {
      s.error = (a.payload as string) || "Could not update invoice";
    });

    b.addCase(markInvoicePaid.fulfilled, (s, a: PayloadAction<Invoice>) => {
      s.invoiceDetail = a.payload;
      const idx = s.invoices?.findIndex((i) => i.id === a.payload.id) ?? -1;
      if (s.invoices && idx !== -1) s.invoices[idx] = a.payload;
    });
    b.addCase(markInvoicePaid.rejected, (s, a) => {
      s.error = (a.payload as string) || "Could not mark invoice as paid";
    });

    b.addCase(deleteInvoice.fulfilled, (s, a) => {
      s.invoices = s.invoices?.filter((i) => i.id !== a.payload) ?? null;
      if (s.invoiceDetail?.id === a.payload) s.invoiceDetail = null;
    });
    b.addCase(deleteInvoice.rejected, (s, a) => {
      s.error = (a.payload as string) || "Could not delete invoice";
    });
  },
});

export const { clearInvoiceDetail } = slice.actions;
export default slice.reducer;

export const selectInvoices = (state: RootState) => state.invoices.invoices;
export const selectInvoiceDetail = (state: RootState) => state.invoices.invoiceDetail;
export const selectInvoicesLoading = (state: RootState) => state.invoices.loading;
export const selectInvoicesError = (state: RootState) => state.invoices.error;