import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import * as notificationApi from "./apiClient";
import { notificationInitialExtraState, type Notification, type RegisterDeviceTokenInput } from "./types";

const adapter = createEntityAdapter<Notification>({
  sortComparer: (a, b) => (a.created_at < b.created_at ? 1 : -1),
});

export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnread",
  notificationApi.listUnreadNotifications,
);

export const fetchAllNotifications = createAsyncThunk(
  "notifications/fetchAll",
  notificationApi.listAllNotifications,
);
export const deleteNotifications = createAsyncThunk(
  "notifications/delete",
  (messageId?: string[]) => notificationApi.removeNotification(messageId),
);
export const markRead = createAsyncThunk(
  "notifications/read",
  (args: { tenantSlug: string; id: string }) =>
    notificationApi.markNotificationRead(args.id),
);

export const markAllRead = createAsyncThunk(
  "notifications/readAll",
  notificationApi.markAllNotificationsRead,
);

export const registerDeviceToken = createAsyncThunk(
  "notifications/registerDeviceToken",
  (input: RegisterDeviceTokenInput) =>
    notificationApi.registerDeviceToken(input),
);

export const unregisterDeviceToken = createAsyncThunk(
  "notifications/unregisterDeviceToken",
  (token: string) => notificationApi.unregisterDeviceToken(token),
);

const slice = createSlice({
  name: "notifications",
  initialState: adapter.getInitialState(notificationInitialExtraState),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        adapter.upsertMany(state, action.payload);
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch notifications";
      })
      .addCase(fetchAllNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        adapter.upsertMany(state, action.payload);
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch notifications";
      })
      .addCase(deleteNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(deleteNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        const ids = action.meta.arg;
        if (ids && ids.length > 0) {
          adapter.removeMany(state, ids);
        } else {
          adapter.removeAll(state);
        }
      })
      
      .addCase(deleteNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to delete notifications";
      })
      .addCase(markRead.fulfilled, (state, action) => {
        adapter.updateOne(state, {
          id: action.payload,
          changes: { isRead: true },
        });
      })
      .addCase(markAllRead.fulfilled, (state) => {
        const ids = Object.keys(state.entities);
        adapter.updateMany(
          state,
          ids.map((id) => ({ id, changes: { isRead: true } })),
        );
      });
  },
});

export default slice.reducer;
export const notificationsSelectors = adapter.getSelectors<RootState>(
  (state) => state.notifications,
);
export const selectUnreadCount = (state: RootState) =>
  notificationsSelectors.selectAll(state).filter((n) => !n.isRead).length;