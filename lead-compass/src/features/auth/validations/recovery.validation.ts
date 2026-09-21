import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)");

export const ForgotPswdSchema = z.object({
  email: z.string().email("Invalid email address!"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const VerifyForgotPasswordOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const ResetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ChangePasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const VerifyChangePasswordOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const UpdatePasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type VerifyChangePasswordOtpRequest = z.infer<typeof VerifyChangePasswordOtpSchema>;
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type VerifyForgotPasswordOtpRequest = z.infer<typeof VerifyForgotPasswordOtpSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPswdSchema>;

// Dedicated step-by-step form schemas for the UI flow
export const RequestOtpFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});
export type RequestOtpFormValues = z.infer<typeof RequestOtpFormSchema>;

export const VerifyOtpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "Please enter all 6 digits of the OTP"),
});
export type VerifyOtpFormValues = z.infer<typeof VerifyOtpFormSchema>;

export const ResetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

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

