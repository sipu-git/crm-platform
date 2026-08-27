import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { profileApi } from "./client";
import { handleApiError } from "@/lib/apiError";
import { Profile, ProfileState, UpdateProfilePayload, DeleteProfilePayload } from "./types";

const initialState: ProfileState = {
    data: null,
    fetchStatus: "idle",
    fetchError: null,
    updateStatus: "idle",
    updateError: null,
    deleteStatus: "idle",
    deleteError: null,
};

export const fetchProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
    "profile/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await profileApi.get();
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    },
);

export const updateProfile = createAsyncThunk<Profile, UpdateProfilePayload, { rejectValue: string }>(
    "profile/updateProfile",
    async (payload, { rejectWithValue }) => {
        try {
            const res= await profileApi.update(payload);
            return res.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    },
);

export const deleteProfile = createAsyncThunk<{ deleted: true }, DeleteProfilePayload, { rejectValue: string }>(
    "profile/deleteProfile",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await profileApi.remove(payload);
            return res.data.data;
        } catch (error) {
            return rejectWithValue(handleApiError(error));
        }
    },
);


const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        resetUpdateStatus(state) {
            state.updateStatus = "idle";
            state.updateError = null;
        },
        resetDeleteStatus(state) {
            state.deleteStatus = "idle";
            state.deleteError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchProfile.pending, (state) => {
                state.fetchStatus = "loading";
                state.fetchError = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                state.fetchStatus = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.fetchStatus = "failed";
                state.fetchError = action.payload ?? "Failed to load profile";
            })

            // update
            .addCase(updateProfile.pending, (state) => {
                state.updateStatus = "loading";
                state.updateError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
                state.updateStatus = "succeeded";
                state.data = action.payload; // server response is the merged source of truth
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.updateError = action.payload ?? "Failed to update profile";
            })

            // delete
            .addCase(deleteProfile.pending, (state) => {
                state.deleteStatus = "loading";
                state.deleteError = null;
            })
            .addCase(deleteProfile.fulfilled, (state) => {
                state.deleteStatus = "succeeded";
                state.data = null; // account is gone — clear local state
            })
            .addCase(deleteProfile.rejected, (state, action) => {
                state.deleteStatus = "failed";
                state.deleteError = action.payload ?? "Failed to delete account";
            });
    },
});

export const { resetUpdateStatus, resetDeleteStatus } = profileSlice.actions;
export default profileSlice.reducer;