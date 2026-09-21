import type { Request, Response } from 'express';
import { signupService } from './signup.service.js';
import {
  sendSignupOtpSchema,
  verifySignupOtpSchema,
  checkSlugSchema,
  completeSignupSchema,
} from './signup.schema.js';
import { env } from '../../../shared/configs/env.js';
import { successResponse } from '../../../shared/utils/ApiResponse.js';

const getRefreshCookieOptions = (req: Request) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export const signupController = {
  async sendOtp(req: Request, res: Response) {
    const { email } = sendSignupOtpSchema.parse(req.body);
    const result = await signupService.sendSignupOtp(email);
    return res.status(200).json(successResponse(result.message, result));
  },

  async verifyOtp(req: Request, res: Response) {
    const { email, otp } = verifySignupOtpSchema.parse(req.body);
    const result = await signupService.verifySignupOtp(email, otp);
    return res.status(200).json(successResponse('OTP verified successfully', result));
  },

  async checkSlug(req: Request, res: Response) {
    const { slug } = checkSlugSchema.parse(req.body);
    const result = await signupService.checkSlugAvailability(slug);
    return res.status(200).json(successResponse('Slug check complete', result));
  },

  async complete(req: Request, res: Response) {
    const input = completeSignupSchema.parse(req.body);
    const result = await signupService.completeSignup(input);
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions(req));
    return res.status(201).json(successResponse('Workspace created successfully', result));
  },

  async checkUserExists(req: Request, res: Response) {
    const email = (req.query.email as string) || (req.body && req.body.email);
    const result = await signupService.checkUserExists(email);
    return res.status(200).json(successResponse('User exists check complete', result));
  },
};

