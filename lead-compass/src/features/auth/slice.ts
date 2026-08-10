import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { ApiUser } from "@/api/types";
import { AuthResult, AuthState, RegisterPayload, RegisterResult } from "./auth.types";

const TOKEN_KEY = "crm.auth.token";
const TENANT_KEY = "crm.tenant.slug";

const initialToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

const initialState: AuthState = {
  token: initialToken,
  user: null,
  tenants: [],
  status: "idle",
  registerStatus: "idle",
  error: null,
  registerError: null,
};

function persistSession(accessToken: string, tenantId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(TENANT_KEY, tenantId);
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", payload);
      return res.data as AuthResult;
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || err.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", payload);
      return res.data as RegisterResult;
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || err.message || "Registration failed");
    }
  },
);

export const fetchMe = createAsyncThunk("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    return (await api.post("/auth/refresh")).data as { accessToken: string; user: ApiUser };
  } catch (e) {
    return rejectWithValue((e as Error).message || "Session expired");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // clear client state regardless of whether the server call succeeds
  }
  return true;
});

function applySession(state: AuthState, payload: AuthResult) {
  state.status = "succeeded";
  state.token = payload.accessToken;
  state.user = payload.user;
  state.tenants = [
    { id: payload.user.tenantId, slug: payload.user.tenantId, name: "Workspace", primaryColor: "#4F46E5" },
  ];
  persistSession(payload.accessToken, payload.user.tenantId);
}

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenants = [];
      state.status = "idle";
      clearSession();
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, action.payload);
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

    b.addCase(registerUser.pending, (s) => {
      s.registerStatus = "loading";
      s.registerError = null;
    });
    b.addCase(registerUser.fulfilled, (s) => {
      s.registerStatus = "succeeded";
    });
    b.addCase(registerUser.rejected, (s, a) => {
      s.registerStatus = "failed";
      s.registerError = (a.payload as string) || a.error.message || "Registration failed";
    });

    b.addCase(fetchMe.fulfilled, (s, a) => applySession(s, a.payload));
    b.addCase(fetchMe.rejected, (s) => {
      s.token = null;
      s.user = null;
      clearSession();
    });
    b.addCase(logoutUser.fulfilled, (s) => {
      s.token = null;
      s.user = null;
      s.tenants = [];
      s.status = "idle";
      clearSession();
    });
  },
});

export const { logout, setToken,resetRegisterStatus } = slice.actions;
export default slice.reducer;
