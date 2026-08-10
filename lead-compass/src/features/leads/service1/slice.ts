import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { leadApis } from "./lead.service";
import { handleApiError } from "@/lib/apiError";
import { Lead, LeadState, UpdateLeadInput } from "./lead.types";
import { CreateLeadInput } from "./lead.validates";

const initialStates: LeadState = {
  leads: [],
  leadDetail: null,
  loading: false,
  error: null,
  success: false,
};

export const addLead = createAsyncThunk(
  "leads/add",
  async (data: CreateLeadInput, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      const response = await leadApis.addLead(data);
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const viewLeads = createAsyncThunk(
  "leads/viewAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      const response = await leadApis.viewLeads();
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const viewLead = createAsyncThunk(
  "leads/viewById",
  async (leadId: string, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      const response = await leadApis.viewLead(leadId);
      console.log("response data:", response.data)
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  "leads/updateStatus",
  async (
    { leadId, data }: { leadId: string; data: Partial<Lead> },
    { rejectWithValue }
  ) => {
    try {
      const response = await leadApis.updateLeadStatus(leadId, data);
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const assignLead = createAsyncThunk(
  "leads/assign",
  async (
    { leadId, assignId }: { leadId: string; assignId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await leadApis.assign(leadId, assignId);
      return response.data.data as Lead;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async ({ leadId, data }: { leadId: string; data: UpdateLeadInput }, { rejectWithValue }) => {
    try {
      const response = await leadApis.updateLead(leadId, data);
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
export const deleteLead = createAsyncThunk(
  "leads/delete",
  async (leadId: string, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      await leadApis.deleteLead(leadId);
      return { leadId };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteAllLeads = createAsyncThunk(
  "leads/removeAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      const response = await leadApis.removeAllLeads();
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const filterLeads = createAsyncThunk(
  "leads/filter",
  async (_, { rejectWithValue, getState }) => {
    try {
      // const accountId = selectActiveAccountId(getState());
      // setActiveApiAccountId(accountId);
      const response = await leadApis.filterLeads("month");
      return { data: response.data.data };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
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
  extraReducers: (builder) => {
    // Add Lead
    builder
      .addCase(addLead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads.push(action.payload.data);
        state.success = true;
        state.error = null;
      })
      .addCase(addLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // View All Leads
    builder
      .addCase(viewLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data ?? [];
        state.error = null;
      })
      .addCase(viewLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // View Single Lead
    builder
      .addCase(viewLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leadDetail = action.payload.data;
        const idx = state.leads.findIndex((l) => l.id === action.payload.data.id);
        if (idx > -1) {
          state.leads[idx] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(viewLead.rejected, (state, action) => {
        state.loading = false;
        state.leadDetail = null;
        state.error = action.payload as string;
      });

    // Update Lead Status
    builder
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.leads.findIndex((l) => l.id === action.payload.data.id);
        if (idx > -1) {
          state.leads[idx] = action.payload.data;
        }
        if (state.leadDetail?.id === action.payload.data.id) {
          state.leadDetail = action.payload.data;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
    builder
      .addCase(assignLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leadDetail = action.payload;
      })
      .addCase(assignLead.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to assign lead";
      });
    // Delete Lead
    builder
      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter((l) => l.id !== action.payload.leadId);
        if (state.leadDetail?.id === action.payload.leadId) {
          state.leadDetail = null;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    builder
      .addCase(deleteAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.leadDetail = null;
        state.leads = [];
        state.error = null;
      })
      .addCase(deleteAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Filter Leads
    builder
      .addCase(filterLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.error = null;
      })
      .addCase(filterLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, resetLeadState, clearLeadDetail } =leadSlice.actions;
export default leadSlice.reducer;