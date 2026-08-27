import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { TeamUser, InvitePayload, InviteResult, UpdateRolePayload, UsersState } from "./types";
import { handleApiError } from "@/lib/apiError";

const initialState: UsersState = {
    items: [],
    status: "idle",
    error: null,
    inviteStatus: "idle",
    inviteError: null,
    updateRoleStatus: "idle",
    updateRoleError: null,
    removeStatus: "idle",
    removeError: null,
    lastInviteResult: null,
};

export const fetchUsers = createAsyncThunk(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/users");
            return res.data.data as TeamUser[];
        } catch (e) {
            return rejectWithValue(handleApiError(e));
        }
    },
);

export const inviteUser = createAsyncThunk(
    "users/invite",
    async (payload: InvitePayload, { rejectWithValue }) => {
        try {
            const res = await api.post("/users/invite", payload);
            return res.data.data as InviteResult;
        } catch (e) {
            return rejectWithValue(handleApiError(e));
        }
    },
);

export const updateUserRole = createAsyncThunk(
    "users/updateRole",
    async ({ userId, role }: UpdateRolePayload, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/users/${userId}/role`, { role });
            return res.data.data as TeamUser;
        } catch (e) {
            return rejectWithValue(handleApiError(e));
        }
    },
);

export const removeUser = createAsyncThunk(
    "users/remove",
    async (userId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${userId}`);
            return userId;
        } catch (e) {
            return rejectWithValue(handleApiError(e));
        }
    },
);

const slice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearInviteResult(state) {
            state.lastInviteResult = null;
            state.inviteStatus = "idle";
            state.inviteError = null;
        },
        resetUpdateRoleStatus(state) {
            state.updateRoleStatus = "idle";
            state.updateRoleError = null;
        },
        resetRemoveStatus(state) {
            state.removeStatus = "idle";
            state.removeError = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchUsers.pending, (s) => {
            s.status = "loading";
            s.error = null;
        });
        b.addCase(fetchUsers.fulfilled, (s, a) => {
            s.status = "succeeded";
            s.items = a.payload;
        });
        b.addCase(fetchUsers.rejected, (s, a) => {
            s.status = "failed";
            s.error = (a.payload as string) || a.error.message || "Failed to load team members";
        });

        b.addCase(inviteUser.pending, (s) => {
            s.inviteStatus = "loading";
            s.inviteError = null;
        });
        b.addCase(inviteUser.fulfilled, (s, a) => {
            s.inviteStatus = "succeeded";
            s.items.push(a.payload.user);
            s.lastInviteResult = a.payload;
        });
        b.addCase(inviteUser.rejected, (s, a) => {
            s.inviteStatus = "failed";
            s.inviteError = (a.payload as string) || a.error.message || "Failed to invite user";
        });

        b.addCase(updateUserRole.pending, (s) => {
            s.updateRoleStatus = "loading";
            s.updateRoleError = null;
        });
        b.addCase(updateUserRole.fulfilled, (s, a) => {
            s.updateRoleStatus = "succeeded";
            const idx = s.items.findIndex((u) => u.id === a.payload.id);
            if (idx !== -1) s.items[idx] = a.payload;
        });
        b.addCase(updateUserRole.rejected, (s, a) => {
            s.updateRoleStatus = "failed";
            s.updateRoleError = (a.payload as string) || a.error.message || "Failed to update role";
        });

        b.addCase(removeUser.pending, (s) => {
            s.removeStatus = "loading";
            s.removeError = null;
        });
        b.addCase(removeUser.fulfilled, (s, a) => {
            s.removeStatus = "succeeded";
            s.items = s.items.filter((u) => u.id !== a.payload);
        });
        b.addCase(removeUser.rejected, (s, a) => {
            s.removeStatus = "failed";
            s.removeError = (a.payload as string) || a.error.message || "Failed to remove user";
        });
    },
});

export const { clearInviteResult, resetUpdateRoleStatus, resetRemoveStatus } = slice.actions;
export default slice.reducer;