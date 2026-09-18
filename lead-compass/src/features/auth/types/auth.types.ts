export type Role =
  "SUPER_ADMIN" |
  "ADMIN" |
  "MANAGER" |
  "SALES_REP" |
  "FINANCE" |
  "CLIENT";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
};

/** Payload for login endpoint */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Payload for token refresh endpoint */
export type RefreshPayload = {
  /** Refresh token stored in localStorage (may be null) */
  refreshToken: string | null;
};

/** Payload for logout endpoint – currently empty but kept for extensibility */
export type LogoutPayload = {
  // No required fields
};

export type RegisterPayload = {
  full_name: string;
  company_name: string;
  email: string;
  password: string;
  role: string;
};

export type RegisterResult = {
  userId: string;
  tenantId: string;
};

export type AuthResult = {
  accessToken: string;
  refreshToken?: string;
  user: ApiUser;
  permissions: string[];
  /**
   * Login request status. Mirrors React‑Query's state but kept for backward compatibility.
   */
  status?: "idle" | "loading" | "succeeded" | "failed";
  /**
   * Optional error message from the login request.
   */
  error?: string | null;
};

/** Response shape for the list‑users endpoint */
export type UsersResponse = ApiUser[];

export interface AuthState {
  token: string | null;
  user: ApiUser | null;
  permissions: string[];
  users: ApiUser[];
  tenants: {
    id: string;
    slug: string;
    name: string;
    primaryColor: string;
  }[];
  status: "idle" | "loading" | "succeeded" | "failed";
  registerStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  registerError: string | null;
  usersStatus: "idle" | "loading" | "succeeded" | "failed";
  usersError: string | null;
}

