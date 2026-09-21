import { z } from 'zod';

export const sendSignupOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const verifySignupOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const checkSlugSchema = z.object({
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(50, 'Slug cannot exceed 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const checkUserExistsSchema = z.object({
  email: z.string().email().optional(),
});

export const completeSignupSchema = z.object({
  verificationToken: z.string().min(1, 'Email verification is required'),
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenant_name: z.string().min(2, 'Workspace name is required'),
  tenant_slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  crm_goals: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
  team_invites: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(['ADMIN', 'MANAGER', 'SALES_REP', 'USER']).default('USER'),
    })
  ).optional(),
});

export type SendSignupOtpInput = z.infer<typeof sendSignupOtpSchema>;
export type VerifySignupOtpInput = z.infer<typeof verifySignupOtpSchema>;
export type CheckSlugInput = z.infer<typeof checkSlugSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
