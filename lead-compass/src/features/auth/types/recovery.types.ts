import type {
  ChangePasswordRequest,
  VerifyForgotPasswordOtpRequest,
} from "@/features/auth/validations/recovery.validation";

export type RecoveryStep = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

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

export type SendForgotOtpPayload = ChangePasswordRequest;
export type VerifyForgotOtpPayload = VerifyForgotPasswordOtpRequest;
export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

