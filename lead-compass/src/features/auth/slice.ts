// Auth slice has been removed in favor of React‑Query state management.

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const TOKEN_KEY = "crm.auth.token";
const REFRESH_TOKEN_KEY = "crm.auth.refresh_token";
const TENANT_KEY = "crm.tenant.slug";

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  user: null,
  permissions: [],
  users: [],
  tenants: [],
  status: "idle",
  registerStatus: "idle",
  error: null,
  registerError: null,
  usersStatus: "idle",
  usersError: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, action.payload);
    },
    setUser(state, action: PayloadAction<ApiUser | null>) {
      state.user = action.payload;
    },
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.permissions = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TENANT_KEY);
      }
    },
  },
});

export const { setToken, clearSession } = authSlice.actions;
export default authSlice.reducer;