import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { InvoiceItem, InvoiceItemStates, CreateInvoiceItemInput, UpdateInvoiceItemInput } from "./types";
import { invoiceItemApis } from "./apiClients";
import type { RootState } from "@/store";

const initialState: InvoiceItemStates = {
    items: null,
    itemDetail: null,
    loading: false,
    error: null,
};

export const fetchInvoiceItems = createAsyncThunk(
    "invoiceItems/fetch",
    async (invoiceId: string) => (await invoiceItemApis.list(invoiceId)).data.data
);

export const fetchInvoiceItem = createAsyncThunk(
    "invoiceItems/fetchOne",
    async ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) =>
        (await invoiceItemApis.getById(invoiceId, itemId)).data.data
);

export const createInvoiceItem = createAsyncThunk(
    "invoiceItems/create",
    async ({ invoiceId, data }: { invoiceId: string; data: CreateInvoiceItemInput }) =>
        (await invoiceItemApis.create(invoiceId, data)).data.data
);

export const updateInvoiceItem = createAsyncThunk(
    "invoiceItems/update",
    async ({ invoiceId, itemId, data }: { invoiceId: string; itemId: string; data: UpdateInvoiceItemInput }) =>
        (await invoiceItemApis.update(invoiceId, itemId, data)).data.data
);

export const deleteInvoiceItem = createAsyncThunk(
    "invoiceItems/delete",
    async ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) => {
        await invoiceItemApis.remove(invoiceId, itemId);
        return itemId;
    }
);

const slice = createSlice({
    name: "invoiceItems",
    initialState,
    reducers: {
        clearInvoiceItemDetail(state) {
            state.itemDetail = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchInvoiceItems.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchInvoiceItems.fulfilled, (s, a) => {
            s.loading = false;
            s.items = a.payload;
        });
        b.addCase(fetchInvoiceItems.rejected, (s, a) => {
            s.loading = false;
            s.error = a.error.message || "Could not load invoice items";
        });

        b.addCase(fetchInvoiceItem.pending, (s) => {
            s.loading = true;
            s.error = null;
        });
        b.addCase(fetchInvoiceItem.fulfilled, (s, a) => {
            s.loading = false;
            s.itemDetail = a.payload;
        });
        b.addCase(fetchInvoiceItem.rejected, (s, a) => {
            s.loading = false;
            s.error = a.error.message || "Could not load invoice item";
        });

        b.addCase(createInvoiceItem.fulfilled, (s, a: PayloadAction<InvoiceItem>) => {
            s.items = s.items ? [...s.items, a.payload] : [a.payload];
        });
        b.addCase(createInvoiceItem.rejected, (s, a) => {
            s.error = a.error.message || "Could not add invoice item";
        });

        b.addCase(updateInvoiceItem.fulfilled, (s, a: PayloadAction<InvoiceItem>) => {
            s.itemDetail = a.payload;
            const idx = s.items?.findIndex((i) => i.id === a.payload.id) ?? -1;
            if (s.items && idx !== -1) s.items[idx] = a.payload;
        });
        b.addCase(updateInvoiceItem.rejected, (s, a) => {
            s.error = a.error.message || "Could not update invoice item";
        });

        b.addCase(deleteInvoiceItem.fulfilled, (s, a) => {
            s.items = s.items?.filter((i) => i.id !== a.payload) ?? null;
            if (s.itemDetail?.id === a.payload) s.itemDetail = null;
        });
        b.addCase(deleteInvoiceItem.rejected, (s, a) => {
            s.error = a.error.message || "Could not delete invoice item";
        });
    },
});

export const { clearInvoiceItemDetail } = slice.actions;
export default slice.reducer;

export const selectInvoiceItems = (state: RootState) => state.invoiceItems.items;
export const selectInvoiceItemDetail = (state: RootState) => state.invoiceItems.itemDetail;
export const selectInvoiceItemsLoading = (state: RootState) => state.invoiceItems.loading;
export const selectInvoiceItemsError = (state: RootState) => state.invoiceItems.error;