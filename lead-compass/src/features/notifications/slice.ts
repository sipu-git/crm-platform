import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { Notification } from "@/lib/mockDb";
import type { RootState } from "@/store";

const adapter = createEntityAdapter<Notification>({
  sortComparer: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
});

interface Extra {
  status: "idle" | "loading" | "succeeded" | "failed";
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (tenantSlug: string) =>
    (await api.get<Notification[]>(`/${tenantSlug}/notifications`)).data,
);

export const markRead = createAsyncThunk(
  "notifications/read",
  async (args: { tenantSlug: string; id: string }) => {
    await api.patch(`/${args.tenantSlug}/notifications/${args.id}/read`);
    return args.id;
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/readAll",
  async (tenantSlug: string) => {
    await api.post(`/${tenantSlug}/notifications/read-all`);
    return true;
  },
);

const slice = createSlice({
  name: "notifications",
  initialState: adapter.getInitialState<Extra>({ status: "idle" }),
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchNotifications.pending, (s) => {
      s.status = "loading";
    });
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.status = "succeeded";
      adapter.setAll(s, a.payload);
    });
    b.addCase(markRead.fulfilled, (s, a) => {
      const n = s.entities[a.payload];
      if (n) adapter.upsertOne(s, { ...n, read: true });
    });
    b.addCase(markAllRead.fulfilled, (s) => {
      const all = Object.values(s.entities).filter((n): n is Notification => !!n);
      adapter.setAll(s, all.map((n) => ({ ...n, read: true })));
    });
  },
});

export default slice.reducer;
export const notificationsSelectors = adapter.getSelectors<RootState>((s) => s.notifications);
