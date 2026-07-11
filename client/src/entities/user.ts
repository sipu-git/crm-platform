export type UserRole = "admin" | "manager" | "member";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}
