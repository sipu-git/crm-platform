// features/communications/communication.slice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Communication,
  CommunicationFilters,
  CommunicationPayload,
  CommunicationsResponse,
  CommunicationState,
} from "./communication.types";
import { communicationApis } from "./communication.service";
import { handleApiError } from "@/lib/apiError";

const INITIAL_STATE: CommunicationState = {
  data: null,
  communication: null,
  loading: false,
  error: null,
  filters: {},
};

export const sendMessage = createAsyncThunk<Communication,
  { leadId: string; payload: CommunicationPayload },
  { rejectValue: string }
>("communications/create", async ({ leadId, payload }, { rejectWithValue }) => {
  try {
    const response = await communicationApis.addCommunication(payload, leadId);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(handleApiError(error));
  }
});

export const viewCommunications = createAsyncThunk<CommunicationsResponse, string, { rejectValue: string }
>("communications/view", async (leadId, { rejectWithValue }) => {
  try {
    const response = await communicationApis.viewCommunications(leadId);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});
// export const viewCommunications = createAsyncThunk<Communication[],
//   { leadId: string; filters?: CommunicationFilters },
//   { rejectValue: string }
// >("communications/view", async ({ leadId, filters }, { rejectWithValue }) => {
//   try {
//     const response = await communicationApis.viewCommunications(leadId, filters);

//     if (!response.success) {
//       return rejectWithValue(response.message || "Failed to load communications");
//     }

//     return response.data;
//   } catch (error: any) {
//     return rejectWithValue(
//       error?.response?.data?.message || error?.message || "Failed to load communications"
//     );
//   }
// });

const communicationSlice = createSlice({
  name: "communications",
  initialState: INITIAL_STATE,
  reducers: {
    clearCommunicationError: (state) => {
      state.error = null;
    },
    resetActiveCommunication: (state) => {
      state.communication = null;
    },
    setCommunicationFilters: (
      state,
      action: PayloadAction<CommunicationFilters>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCommunicationFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // send / create
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.communication = action.payload;
        state.data?.communications.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to send message";
      })
    builder
      .addCase(viewCommunications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewCommunications.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(viewCommunications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load communications";
      });
    // view / list
    //   .addCase(viewCommunications.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(viewCommunications.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.data = action.payload;
    //   })
    //   .addCase(viewCommunications.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload ?? "Failed to load communications";
    //   });
  },
});

export const {
  clearCommunicationError,
  resetActiveCommunication,
  setCommunicationFilters,
  clearCommunicationFilters,
} = communicationSlice.actions;
export default communicationSlice.reducer;