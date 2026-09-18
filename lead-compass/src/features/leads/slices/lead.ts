import { createSlice } from "@reduxjs/toolkit";
import { LeadState } from "../types/lead.types";

const initialStates: LeadState = {
  leads: [],
  leadDetail: null,
  loading: false,
  error: null,
  success: false,
};

// Slice kept for rootReducer compatibility, but no longer handles fetch logic
export const leadSlice = createSlice({
  name: "leads",
  initialState: initialStates,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.loading = false;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetLeadState: (state) => {
      return initialStates;
    },
    clearLeadDetail: (state) => {
      state.leadDetail = null;
    },
  },
});

export const { clearError, clearSuccess, resetLeadState, clearLeadDetail } = leadSlice.actions;
export default leadSlice.reducer;