import { api } from "@/api/client";
import type {
  ChangePasswordRequest,
  VerifyForgotPasswordOtpRequest,
} from "@/lib/validations/recovery.validation";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface VerifyOtpResponseData {
  isValid: boolean;
  userId: string;
  resetToken: string;
}

// Module auth recovery endpoint base path
const RECOVERY_BASE_URL = "/module-auth/recovery";
const FALLBACK_RECOVERY_URL = "/recovery";

async function postWithFallback<T>(path: string, body: any, headers?: Record<string, string>): Promise<T> {
  try {
    const res = await api.post<T>(`${RECOVERY_BASE_URL}${path}`, body, { headers });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      const res = await api.post<T>(`${FALLBACK_RECOVERY_URL}${path}`, body, { headers });
      return res.data;
    }
    throw err;
  }
}

async function patchWithFallback<T>(path: string, body: any, headers?: Record<string, string>): Promise<T> {
  try {
    const res = await api.patch<T>(`${RECOVERY_BASE_URL}${path}`, body, { headers });
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      const res = await api.patch<T>(`${FALLBACK_RECOVERY_URL}${path}`, body, { headers });
      return res.data;
    }
    throw err;
  }
}

export const recoveryService = {
  /**
   * Request an OTP to be sent to the user's email address
   */
  async sendForgotOtp(payload: ChangePasswordRequest): Promise<ApiResponse<string>> {
    return postWithFallback<ApiResponse<string>>("/send-otp", payload);
  },

  /**
   * Verify the 6-digit OTP sent to the user's email
   */
  async verifyForgotPasswordOtp(payload: VerifyForgotPasswordOtpRequest): Promise<ApiResponse<VerifyOtpResponseData>> {
    return postWithFallback<ApiResponse<VerifyOtpResponseData>>("/verify-otp", payload);
  },

  /**
   * Reset the user's password using the temporary resetToken
   */
  async resetPasswordWithOtp(resetToken: string, newPassword: string): Promise<ApiResponse<any>> {
    return patchWithFallback<ApiResponse<any>>(
      "/reset-password",
      { newPassword },
      { Authorization: `Bearer ${resetToken}` },
    );
  },
};

