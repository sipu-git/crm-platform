import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/api/client";
import { handleApiError } from "@/lib/apiError";
import { ApiUser, AuthResult, AuthState, RegisterPayload, RegisterResult } from "./auth.types";

const TOKEN_KEY = "crm.auth.token";
const REFRESH_TOKEN_KEY = "crm.auth.refresh_token";
const TENANT_KEY = "crm.tenant.slug";

const initialToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
const sub_url = "/module-auth/auth";
const initialState: AuthState = {
  token: initialToken,
  user: null,
  permissions: [],
  tenants: [],
  status: "idle",
  registerStatus: "idle",
  error: null,
  registerError: null,
};

function persistSession(accessToken: string, tenantId: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(TENANT_KEY, tenantId);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(`${sub_url}/login`, payload);
      return res.data as AuthResult;
    } catch (e) {
      return rejectWithValue(handleApiError(e));
    }
  },
);

export const fetchMe = createAsyncThunk("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    return (await api.post(`${sub_url}/refresh`, { refreshToken: storedRefreshToken })).data as AuthResult;
  } catch (e) {
    return rejectWithValue(handleApiError(e));
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post(`${sub_url}/logout`);
  } catch {
    // clear client state regardless of whether the server call succeeds
  }
  return true;
});

function applySession(state: AuthState, payload: AuthResult) {
  state.status = "succeeded";
  state.token = payload.accessToken;
  state.user = payload.user;
  state.permissions = payload.permissions;
  state.tenants = [
    { id: payload.user.tenantId, slug: payload.user.tenantId, name: "Workspace", primaryColor: "#4F46E5" },
  ];
  persistSession(payload.accessToken, payload.user.tenantId, payload.refreshToken);
}

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenants = [];
      state.permissions = [];
      state.status = "idle";
      clearSession();
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (typeof window !== "undefined")
        localStorage.setItem(TOKEN_KEY, action.payload);
    },
    setSession(state, action: PayloadAction<AuthResult>) {
      applySession(state, action.payload);
    },
    resetRegisterStatus(state) {
      state.registerStatus = "idle";
      state.registerError = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => applySession(s, a.payload));
    b.addCase(login.rejected, (s, a) => {
      s.status = "failed";
      s.error = (a.payload as string) || a.error.message || "Login failed";
    });

    b.addCase(fetchMe.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchMe.fulfilled, (s, a) => applySession(s, a.payload));
    b.addCase(fetchMe.rejected, (s, a) => {
      s.status = "failed";
      s.token = null;
      s.user = null;
      s.permissions = [];
      s.error = (a.payload as string) || "Session expired";
      clearSession();
    });
    b.addCase(logoutUser.fulfilled, (s) => {
      s.token = null;
      s.user = null;
      s.tenants = [];
      s.permissions = [];
      s.status = "idle";
      clearSession();
    });
  },
});

export const { logout, setToken, setSession, resetRegisterStatus } = slice.actions;
export default slice.reducer;
