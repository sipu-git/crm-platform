export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SALES_REP"
  | "FINANCE"
  | "CLIENT";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
};

export type ApiTenant = {
  tenant_key: string;
  name: string;
  slug?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RefreshPayload = {
  refreshToken: string | null;
};

export type LogoutPayload = {};

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
  tenant: ApiTenant;
  permissions: string[];
  status?: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

export type UsersResponse = ApiUser[];

export interface AuthState {
  token: string | null;
  user: ApiUser | null;
  tenant: ApiTenant | null;
  permissions: string[];
  users: ApiUser[];

  tenants: {
    tenant_key: string;
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