import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { Lead } from "@/lib/mockDb";
import type { RootState } from "@/store";

const adapter = createEntityAdapter<Lead>({
  sortComparer: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
});

interface Extra {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedIds: string[];
}

export const fetchLeads = createAsyncThunk(
  "leads/fetch",
  async (tenantSlug: string) => (await api.get<Lead[]>(`/${tenantSlug}/leads`)).data,
);

export const createLead = createAsyncThunk(
  "leads/create",
  async (args: { tenantSlug: string; input: Partial<Lead> }) =>
    (await api.post<Lead>(`/${args.tenantSlug}/leads`, args.input)).data,
);

export const updateLead = createAsyncThunk(
  "leads/update",
  async (args: { tenantSlug: string; id: string; changes: Partial<Lead> }) =>
    (await api.patch<Lead>(`/${args.tenantSlug}/leads/${args.id}`, args.changes)).data,
);

export const deleteLead = createAsyncThunk(
  "leads/delete",
  async (args: { tenantSlug: string; id: string }) => {
    await api.delete(`/${args.tenantSlug}/leads/${args.id}`);
    return args.id;
  },
);

export const bulkLeadAction = createAsyncThunk(
  "leads/bulk",
  async (args: {
    tenantSlug: string;
    action: "delete" | "assign";
    ids: string[];
    assignedTo?: string;
  }) => {
    await api.post(`/${args.tenantSlug}/leads/bulk`, args);
    return args;
  },
);

const slice = createSlice({
  name: "leads",
  initialState: adapter.getInitialState<Extra>({
    status: "idle",
    error: null,
    selectedIds: [],
  }),
  reducers: {
    toggleSelected(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id];
    },
    selectAll(state, action: PayloadAction<string[]>) {
      state.selectedIds = action.payload;
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchLeads.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchLeads.fulfilled, (s, a) => {
      s.status = "succeeded";
      adapter.setAll(s, a.payload);
    });
    b.addCase(fetchLeads.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed";
    });
    b.addCase(createLead.fulfilled, (s, a) => {
      adapter.addOne(s, a.payload);
    });
    b.addCase(updateLead.fulfilled, (s, a) => {
      adapter.upsertOne(s, a.payload);
    });
    b.addCase(deleteLead.fulfilled, (s, a) => {
      adapter.removeOne(s, a.payload);
      s.selectedIds = s.selectedIds.filter((x) => x !== a.payload);
    });
    b.addCase(bulkLeadAction.fulfilled, (s, a) => {
      if (a.payload.action === "delete") {
        adapter.removeMany(s, a.payload.ids);
      } else if (a.payload.action === "assign" && a.payload.assignedTo) {
        const at = a.payload.assignedTo;
        a.payload.ids.forEach((id) => {
          const existing = s.entities[id];
          if (existing) adapter.upsertOne(s, { ...existing, assignedTo: at });
        });
      }
      s.selectedIds = [];
    });
  },
});

export const { toggleSelected, selectAll, clearSelection } = slice.actions;
export default slice.reducer;

export const leadsSelectors = adapter.getSelectors<RootState>((s) => s.leads);
