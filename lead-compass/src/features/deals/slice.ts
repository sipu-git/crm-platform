import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { Deal, DealStage } from "@/lib/mockDb";
import type { RootState } from "@/store";

const adapter = createEntityAdapter<Deal>({
  sortComparer: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
});

interface Extra {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  view: "kanban" | "table";
}

export const fetchDeals = createAsyncThunk(
  "deals/fetch",
  async (tenantSlug: string) => (await api.get<Deal[]>(`/${tenantSlug}/deals`)).data,
);

export const createDeal = createAsyncThunk(
  "deals/create",
  async (args: { tenantSlug: string; input: Partial<Deal> }) =>
    (await api.post<Deal>(`/${args.tenantSlug}/deals`, args.input)).data,
);

export const updateDeal = createAsyncThunk(
  "deals/update",
  async (args: { tenantSlug: string; id: string; changes: Partial<Deal> }) =>
    (await api.patch<Deal>(`/${args.tenantSlug}/deals/${args.id}`, args.changes)).data,
);

export const deleteDeal = createAsyncThunk(
  "deals/delete",
  async (args: { tenantSlug: string; id: string }) => {
    await api.delete(`/${args.tenantSlug}/deals/${args.id}`);
    return args.id;
  },
);

const slice = createSlice({
  name: "deals",
  initialState: adapter.getInitialState<Extra>({
    status: "idle",
    error: null,
    view: "kanban",
  }),
  reducers: {
    // Optimistic stage change; will be reverted by revertStage if API fails.
    moveDealOptimistic(state, action: PayloadAction<{ id: string; stage: DealStage }>) {
      const d = state.entities[action.payload.id];
      if (d) adapter.upsertOne(state, { ...d, stage: action.payload.stage });
    },
    revertStage(state, action: PayloadAction<{ id: string; stage: DealStage }>) {
      const d = state.entities[action.payload.id];
      if (d) adapter.upsertOne(state, { ...d, stage: action.payload.stage });
    },
    setView(state, action: PayloadAction<"kanban" | "table">) {
      state.view = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchDeals.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchDeals.fulfilled, (s, a) => {
      s.status = "succeeded";
      adapter.setAll(s, a.payload);
    });
    b.addCase(fetchDeals.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed";
    });
    b.addCase(createDeal.fulfilled, (s, a) => adapter.addOne(s, a.payload));
    b.addCase(updateDeal.fulfilled, (s, a) => adapter.upsertOne(s, a.payload));
    b.addCase(deleteDeal.fulfilled, (s, a) => adapter.removeOne(s, a.payload));
  },
});

export const { moveDealOptimistic, revertStage, setView } = slice.actions;
export default slice.reducer;
export const dealsSelectors = adapter.getSelectors<RootState>((s) => s.deals);
