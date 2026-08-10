export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
};

export type LoginPayload = {
  email: string;
  password: string;
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
  user: ApiUser;
};

export interface AuthState {
  token: string | null;
  user: ApiUser | null;
  tenants: { id: string; slug: string; name: string; primaryColor: string }[];
  status: "idle" | "loading" | "succeeded" | "failed";
  registerStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  registerError: string | null;
}