import { z } from "zod";
import { Role } from "@/features/users/types";

// Zod schema for the Invite User payload
export const inviteUserSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobile: z
    .string()
    .regex(/^[0-9]{7,15}$/, { message: "Invalid mobile number" })
    .min(1, { message: "Mobile is required" }),
  // Role must be one of the allowed roles (excluding CLIENT)
  role: z.enum(["ADMIN", "MANAGER", "SALES_REP", "FINANCE"] as const),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

