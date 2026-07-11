import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { Invoice } from "@/lib/mockDb";
import type { RootState } from "@/store";

const adapter = createEntityAdapter<Invoice>({
  sortComparer: (a, b) => (a.issueDate < b.issueDate ? 1 : -1),
});

interface Extra {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const fetchInvoices = createAsyncThunk(
  "invoices/fetch",
  async (tenantSlug: string) => (await api.get<Invoice[]>(`/${tenantSlug}/invoices`)).data,
);

export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (args: { tenantSlug: string; input: Partial<Invoice> }) =>
    (await api.post<Invoice>(`/${args.tenantSlug}/invoices`, args.input)).data,
);

export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async (args: { tenantSlug: string; id: string; changes: Partial<Invoice> }) =>
    (await api.patch<Invoice>(`/${args.tenantSlug}/invoices/${args.id}`, args.changes)).data,
);

export const deleteInvoice = createAsyncThunk(
  "invoices/delete",
  async (args: { tenantSlug: string; id: string }) => {
    await api.delete(`/${args.tenantSlug}/invoices/${args.id}`);
    return args.id;
  },
);

const slice = createSlice({
  name: "invoices",
  initialState: adapter.getInitialState<Extra>({ status: "idle", error: null }),
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchInvoices.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchInvoices.fulfilled, (s, a) => {
      s.status = "succeeded";
      adapter.setAll(s, a.payload);
    });
    b.addCase(fetchInvoices.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed";
    });
    b.addCase(createInvoice.fulfilled, (s, a) => adapter.addOne(s, a.payload));
    b.addCase(updateInvoice.fulfilled, (s, a) => adapter.upsertOne(s, a.payload));
    b.addCase(deleteInvoice.fulfilled, (s, a) => adapter.removeOne(s, a.payload));
  },
});

export default slice.reducer;
export const invoicesSelectors = adapter.getSelectors<RootState>((s) => s.invoices);
