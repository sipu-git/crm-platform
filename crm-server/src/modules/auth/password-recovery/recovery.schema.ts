import z from "zod";

export const ForgotPswdSchema = z.object({
    email: z.string().email("invalid email address!"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
})

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

export const VerifyForgotPasswordOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

 export const ChangePasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});
 
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
 
export const VerifyChangePasswordOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
 
export type VerifyChangePasswordOtpRequest = z.infer<typeof VerifyChangePasswordOtpSchema>;
 
export const UpdatePasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});
 
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordSchema>;
 
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type VerifyForgotPasswordOtpRequest = z.infer<typeof VerifyForgotPasswordOtpSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPswdSchema>;
