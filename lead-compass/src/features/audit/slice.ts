import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { AuditLog } from "@/api/types";
import type { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";

const adapter = createEntityAdapter<AuditLog>();
export const fetchAuditLogs = createAsyncThunk("audit/fetch", async () => (await api.get<AuditLog[]>("/audit")).data);
const slice = createSlice({
  name: "audit",
  initialState: adapter.getInitialState({ status: "idle" as "idle" | "loading" | "failed" }),
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAuditLogs.pending, (s) => { s.status = "loading"; });
    b.addCase(fetchAuditLogs.fulfilled, (s, a) => { s.status = "idle"; adapter.setAll(s, a.payload); });
    b.addCase(fetchAuditLogs.rejected, (s) => { s.status = "failed"; });
  },
});
export default slice.reducer;
export const auditSelectors = adapter.getSelectors<RootState>((s) => s.audit);

// React‑Query hook for audit logs – replaces the need for a Redux thunk in the UI
export const useAuditLogs = () => {
  return useQuery<AuditLog[], Error>({
    queryKey: ["audit", "logs"],
    queryFn: async () => (await api.get<AuditLog[]>("/audit")).data,
    // You can adjust caching here (staleTime, refetchOnWindowFocus, etc.)
    staleTime: 5 * 60_000,
  });
};
