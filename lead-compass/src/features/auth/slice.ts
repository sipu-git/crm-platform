import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/api/client";
import type { Tenant, User } from "@/lib/mockDb";

export interface AuthState {
  token: string | null;
  user: User | null;
  tenants: Tenant[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const TOKEN_KEY = "crm.auth.token";

const initialToken =
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

const initialState: AuthState = {
  token: initialToken,
  user: null,
  tenants: [],
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", payload);
      return res.data as { token: string; user: User; tenants: Tenant[] };
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(err.response?.data?.message || err.message || "Login failed");
    }
  },
);

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/me");
    return res.data as { user: User; tenants: Tenant[] };
  } catch (e) {
    const err = e as { message?: string };
    return rejectWithValue(err.message || "Failed to load user");
  }
});

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.tenants = [];
      state.status = "idle";
      if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, action.payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token = a.payload.token;
      s.user = a.payload.user;
      s.tenants = a.payload.tenants;
      if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, a.payload.token);
    });
    b.addCase(login.rejected, (s, a) => {
      s.status = "failed";
      s.error = (a.payload as string) || a.error.message || "Login failed";
    });
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload.user;
      s.tenants = a.payload.tenants;
    });
  },
});

export const { logout, setToken } = slice.actions;
export default slice.reducer;
