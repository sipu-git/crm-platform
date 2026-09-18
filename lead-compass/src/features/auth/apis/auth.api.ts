import { api } from "@/api/client";
import { AuthResult, LoginPayload, LogoutPayload, RefreshPayload, UsersResponse } from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) => api.post<AuthResult>("/module-auth/auth/login", payload),
  refresh: (payload: RefreshPayload) => api.post<AuthResult>("/module-auth/auth/refresh", payload),
  logout: (payload?: LogoutPayload) => api.post<void>("/module-auth/auth/logout", payload ?? {}),
  listUsers: () => api.get<UsersResponse>("/module-auth/auth/list-users"),
};

