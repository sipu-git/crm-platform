import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TenantState {
  currentSlug: string | null;
}

const KEY = "crm.tenant.slug";
const initial =
  typeof window !== "undefined" ? localStorage.getItem(KEY) : null;

const slice = createSlice({
  name: "tenant",
  initialState: { currentSlug: initial } as TenantState,
  reducers: {
    setCurrentTenant(state, action: PayloadAction<string>) {
      state.currentSlug = action.payload;
      if (typeof window !== "undefined") localStorage.setItem(KEY, action.payload);
    },
    clearTenant(state) {
      state.currentSlug = null;
      if (typeof window !== "undefined") localStorage.removeItem(KEY);
    },
  },
});

export const { setCurrentTenant, clearTenant } = slice.actions;
export default slice.reducer;
