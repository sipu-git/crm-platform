import { z } from "zod";

export const Role = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    company_name: z.string().min(1, "Company name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  values: unknown,
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Partial<Record<string, string>> } {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: Partial<Record<string, string>> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}