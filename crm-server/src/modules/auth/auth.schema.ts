import { z } from 'zod';
import { Role } from '../../shared/configs/role';

export const registerSchema = z.object({
  full_name: z.string().min(1),
  company_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role:z.enum(Role),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
