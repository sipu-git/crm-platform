// features/activities/activity.slice.ts
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store"; // adjust to your actual RootState export path
import { Activity, CreateActivityInput, ListActivitiesQuery, UpdateActivityInput } from "./types";
import { activityApis } from "./activities.service";
import { handleApiError } from "@/lib/apiError";

const activitiesAdapter = createEntityAdapter<Activity>({
  sortComparer: (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
});

export const fetchActivities = createAsyncThunk(
  "activities/fetchAll",
  async (query: ListActivitiesQuery = {}, { rejectWithValue }) => {
    try {
      const response = await activityApis.list(query);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createActivity = createAsyncThunk(
  "activities/create",
  async (data: CreateActivityInput, { rejectWithValue }) => {
    try {
      const response = await activityApis.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateActivity = createAsyncThunk(
  "activities/update",
  async ({ id, data }: { id: string; data: UpdateActivityInput }, { rejectWithValue }) => {
    try {
      const response = await activityApis.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const completeActivity = createAsyncThunk(
  "activities/complete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await activityApis.complete(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await activityApis.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const activitiesSlice = createSlice({
  name: "activities",
  initialState: activitiesAdapter.getInitialState({
    loading: false,
    error: null as string | null,
  }),
  reducers: {
    clearActivitiesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchActivities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        activitiesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to fetch activities";
      })
      // createActivity
      .addCase(createActivity.fulfilled, (state, action) => {
        activitiesAdapter.addOne(state, action.payload);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to create activity";
      })
      // updateActivity
      .addCase(updateActivity.fulfilled, (state, action) => {
        activitiesAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to update activity";
      })
      // completeActivity
      .addCase(completeActivity.fulfilled, (state, action) => {
        activitiesAdapter.upsertOne(state, action.payload);
      })
      .addCase(completeActivity.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to complete activity";
      })
      // deleteActivity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        activitiesAdapter.removeOne(state, action.payload);
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to delete activity";
      });
  },
});

export const { clearActivitiesError } = activitiesSlice.actions;
export default activitiesSlice.reducer;

export const activitiesSelectors = activitiesAdapter.getSelectors(
  (state: RootState) => state.activities
);

export const selectActivitiesLoading = (state: RootState) => state.activities.loading;
export const selectActivitiesError = (state: RootState) => state.activities.error;

// Memoized so components filtering by dealId don't get a new array
// reference (and re-render) on every unrelated state change.
export const selectActivitiesByDeal = (dealId: string) =>
  createSelector(activitiesSelectors.selectAll, (activities) =>
    activities.filter((a) => a.deal_id === dealId)
  );