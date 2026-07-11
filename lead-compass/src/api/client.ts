import axios, { AxiosError } from "axios";
import { mockAdapter } from "@/lib/mockAdapter";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  adapter: mockAdapter,
});

let getAuthToken: () => string | null = () => null;
let getTenantId: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: {
  getAuthToken?: () => string | null;
  getTenantId?: () => string | null;
  onUnauthorized?: () => void;
}) {
  if (opts.getAuthToken) getAuthToken = opts.getAuthToken;
  if (opts.getTenantId) getTenantId = opts.getTenantId;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  const tid = getTenantId();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  if (tid) config.headers.set("X-Tenant-Id", tid);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    if (!error.response) {
      if (typeof window !== "undefined") toast.error("Network error");
      return Promise.reject(error);
    }
    const status = error.response.status;
    const msg = error.response.data?.message || error.message;
    if (status === 401) {
      onUnauthorized();
    } else if (status >= 500) {
      if (typeof window !== "undefined") toast.error(msg || "Server error");
    } else if (status === 403) {
      if (typeof window !== "undefined") toast.error("You don't have access to this resource.");
    }
    return Promise.reject(error);
  },
);
