// features/deals/deal.slice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Deal,
  DealBoardColumn,
  DealFilters,
  DealState,
  MoveDealStageInput,
  UpdateDealInput,
} from "@/features/deals/deal.types";
import type { RootState } from "@/store";
import { dealApis } from "./deal.service";
import { handleApiError } from "@/lib/apiError";

export const fetchDeals = createAsyncThunk<Deal[], DealFilters | undefined, { rejectValue: string }>(
  "deals/fetch",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await dealApis.list({ stageId: filters?.stageId, ownerId: filters?.ownerId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchDealBoard = createAsyncThunk<DealBoardColumn[], void, { rejectValue: string }>(
  "deals/fetchBoard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dealApis.board();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchDeal = createAsyncThunk<Deal, string, { rejectValue: string }>(
  "deals/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await dealApis.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateDeal = createAsyncThunk<
  Deal,
  { id: string; changes: UpdateDealInput },
  { rejectValue: string }
>("deals/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    const response = await dealApis.update(id, changes);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const moveDealStage = createAsyncThunk<
  { deal: Deal; targetStage: DealBoardColumn },
  { id: string; data: MoveDealStageInput },
  { rejectValue: string }
>("deals/moveStage", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await dealApis.moveStage(id, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const deleteDeal = createAsyncThunk<string, string, { rejectValue: string }>(
  "deals/delete",
  async (id, { rejectWithValue }) => {
    try {
      await dealApis.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState: DealState = {
  deals: [],
  board: [],
  dealDetail: null,
  loading: false,
  error: null,
  success: false,
};

const slice = createSlice({
  name: "deals",
  initialState,
  reducers: {
    clearDealDetail(state) {
      state.dealDetail = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchDeals.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchDeals.fulfilled, (s, a: PayloadAction<Deal[]>) => {
      s.loading = false;
      s.deals = a.payload;
    });
    b.addCase(fetchDeals.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Could not load deals";
    });

    b.addCase(fetchDealBoard.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchDealBoard.fulfilled, (s, a: PayloadAction<DealBoardColumn[]>) => {
      s.loading = false;
      s.board = a.payload;
    });
    b.addCase(fetchDealBoard.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Could not load pipeline board";
    });

    b.addCase(fetchDeal.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchDeal.fulfilled, (s, a: PayloadAction<Deal>) => {
      s.loading = false;
      s.dealDetail = a.payload;
    });
    b.addCase(fetchDeal.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Could not load deal";
    });

    b.addCase(updateDeal.pending, (s) => {
      s.error = null;
    });
    b.addCase(updateDeal.fulfilled, (s, a: PayloadAction<Deal>) => {
      s.success = true;
      s.dealDetail = a.payload;
      const idx = s.deals.findIndex((d) => d.id === a.payload.id);
      if (idx !== -1) s.deals[idx] = a.payload;
    });
    b.addCase(updateDeal.rejected, (s, a) => {
      s.error = a.payload ?? "Failed to update deal";
    });

    b.addCase(moveDealStage.pending, (s) => {
      s.error = null;
    });
    b.addCase(
      moveDealStage.fulfilled,
      (s, a: PayloadAction<{ deal: Deal; targetStage: DealBoardColumn }>) => {
        const { deal, targetStage } = a.payload;
        const movedDeal = { ...deal, stage_id: targetStage.id };

        const idx = s.deals.findIndex((d) => d.id === movedDeal.id);
        if (idx !== -1) s.deals[idx] = movedDeal;

        if (s.dealDetail?.id === movedDeal.id) s.dealDetail = movedDeal;

        s.board = s.board.map((column) => ({
          ...column,
          deals: column.deals.filter((d) => d.id !== movedDeal.id),
        }));
        const targetColumn = s.board.find((c) => c.id === targetStage.id);
        if (targetColumn) targetColumn.deals.unshift(movedDeal);
      }
    );
    b.addCase(moveDealStage.rejected, (s, a) => {
      s.error = a.payload ?? "Failed to move deal";
    });

    b.addCase(deleteDeal.fulfilled, (s, a) => {
      s.deals = s.deals.filter((d) => d.id !== a.payload);
      s.board = s.board.map((column) => ({
        ...column,
        deals: column.deals.filter((d) => d.id !== a.payload),
      }));
      if (s.dealDetail?.id === a.payload) s.dealDetail = null;
    });
    b.addCase(deleteDeal.rejected, (s, a) => {
      s.error = a.payload ?? "Failed to delete deal";
    });
  },
});

export const { clearDealDetail } = slice.actions;
export default slice.reducer;

export const selectDeals = (state: RootState) => state.deals.deals;
export const selectDealBoard = (state: RootState) => state.deals.board;
export const selectDealDetail = (state: RootState) => state.deals.dealDetail;
export const selectDealsLoading = (state: RootState) => state.deals.loading;
export const selectDealsError = (state: RootState) => state.deals.error;