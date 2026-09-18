// src/features/search/search.slice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SearchResult, SearchType, SearchParams, SearchFilters } from "./types";
import { searchApi } from "./apiClient";
import { RootState } from "@/store";
import { handleApiError } from "@/lib/apiError";

interface SearchState {
  query: string;
  types: SearchType[];
  filters: SearchFilters;
  results: SearchResult;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  types: [],
  filters: {},
  results: { leads: [], deals: [], invoices: [] },
  status: "idle",
  error: null,
};

let currentController: AbortController | null = null;

export const performSearch = createAsyncThunk<SearchResult, SearchParams, { rejectValue: string }>(
  "search/performSearch",
  async (params, { rejectWithValue }) => {
    currentController?.abort();
    currentController = new AbortController();

    const { query, ...filters } = params;
    const hasFilter = Object.values(filters).some((v) => v !== undefined && v !== "");

    if (!query && !hasFilter) {
      return rejectWithValue("Please provide a search query or filter");
    }

    try {
      const res = await searchApi.search({ ...params, signal: currentController.signal });
      return res.data.data;
    } catch (err: any) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        return rejectWithValue("__CANCELED__");
      }
      return rejectWithValue(handleApiError(err));
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: { payload: string }) {
      state.query = action.payload;
      if (!action.payload.trim() && Object.keys(state.filters).length === 0) {
        state.results = { leads: [], deals: [], invoices: [] };
        state.status = "idle";
      }
    },
    setTypes(state, action: { payload: SearchType[] }) {
      state.types = action.payload;
    },
    setFilters(state, action: { payload: SearchFilters }) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearch(state) {
      currentController?.abort();
      state.query = "";
      state.filters = {};
      state.results = { leads: [], deals: [], invoices: [] };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(performSearch.rejected, (state, action) => {
        if (action.payload === "__CANCELED__") return;
        state.status = "failed";
        state.error = action.payload ?? "Search failed";
      });
  },
});

export const { setQuery, setTypes, setFilters, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;

export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchFilters = (state: RootState) => state.search.filters;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchStatus = (state: RootState) => state.search.status;
export const selectSearchError = (state: RootState) => state.search.error;