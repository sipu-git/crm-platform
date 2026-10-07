import { api } from '../../../api/client';
import type { CompleteSignupPayload, CompleteSignupResponse } from '../types/signup.types';

export async function sendSignupOtpApi(email: string): Promise<{ message: string }> {
  const { data } = await api.post('/module-auth/auth/signup/send-otp', { email });
  return data;
}

export async function verifySignupOtpApi(email: string, otp: string): Promise<{ verificationToken: string }> {
  const { data } = await api.post('/module-auth/auth/signup/verify-otp', { email, otp });
  return data.data;
}

export async function checkSlugApi(slug: string): Promise<{ available: boolean; slug: string; reason?: string }> {
  const { data } = await api.post('/module-auth/auth/signup/check-slug', { slug });
  return data.data;
}

export async function completeSignupApi(payload: CompleteSignupPayload): Promise<CompleteSignupResponse> {
  const { data } = await api.post('/module-auth/auth/signup/complete', payload);
  return data.data;
}

export async function uploadOnboardingLogoApi(file: File): Promise<{ logo_url: string; logoUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/module-auth/auth/signup/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}
