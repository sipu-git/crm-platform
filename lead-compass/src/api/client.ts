import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://crm-platform-backend-91af.onrender.com/api";
// const BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

let getAuthToken: () => string | null = () => null;
let getTenantId: () => string | null = () => null;
let onUnauthorized: () => void = () => { };
let onForbidden: (message: string, from?: string) => void = () => { };
let onTokenRefreshed: (token: string, user?: any, permissions?: string[]) => void = () => { };

export function configureApi(opts: {
  getAuthToken?: () => string | null;
  getTenantId?: () => string | null;
  onUnauthorized?: () => void;
  onForbidden?: (message: string, from?: string) => void;
  onTokenRefreshed?: (token: string, user?: any, permissions?: string[]) => void;
}) {
  if (opts.getAuthToken) getAuthToken = opts.getAuthToken;
  if (opts.getTenantId) getTenantId = opts.getTenantId;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
  if (opts.onForbidden) onForbidden = opts.onForbidden;
  if (opts.onTokenRefreshed) onTokenRefreshed = opts.onTokenRefreshed;
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  const tid = getTenantId();
  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  if (tid) config.headers.set("X-Tenant-Id", tid);

  return config;
});

// Prevents multiple simultaneous refresh calls when several requests 401 at once
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    if (!error.response) {
      if (typeof window !== "undefined") toast.error("Network error");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const msg = error.response.data?.message || error.response.data?.error || error.message;
    const originalRequest = error.config as any;

    if (status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/module-auth/auth/refresh")) {
        // The refresh call itself failed — refresh token is invalid/expired
        onUnauthorized();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request until the in-flight refresh finishes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("crm.auth.refresh_token") : null;
        const { data } = await api.post("/module-auth/auth/refresh", { refreshToken: storedRefreshToken });
        const newToken = data.accessToken;
        onTokenRefreshed(newToken, data.user, data.permissions);
        if (data.refreshToken && typeof window !== "undefined") {
          localStorage.setItem("crm.auth.refresh_token", data.refreshToken);
        }
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        onUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (status >= 500) {
      if (typeof window !== "undefined") toast.error(msg || "Server error");
    } else if (status === 403) {
      onForbidden(msg || "You don't have permission to view this page.", originalRequest?.url);
    }

    return Promise.reject(error);
  },
);
