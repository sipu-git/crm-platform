import { api } from "@/api/client";
import type {
  ApiResponse,
  ResetPasswordPayload,
  SendForgotOtpPayload,
  VerifyForgotOtpPayload,
  VerifyOtpResponseData,
} from "../types/recovery.types";

const RECOVERY_BASE_URL = "/module-auth/recovery";

export const recoveryApi = {
  async sendForgotOtp(payload: SendForgotOtpPayload): Promise<ApiResponse<string>> {
    const res = await api.post<ApiResponse<string>>(`${RECOVERY_BASE_URL}/send-otp`, payload);
    return res.data;
  },

  async verifyForgotPasswordOtp(payload: VerifyForgotOtpPayload): Promise<ApiResponse<VerifyOtpResponseData>> {
    const res = await api.post<ApiResponse<VerifyOtpResponseData>>(`${RECOVERY_BASE_URL}/verify-otp`, payload);
    return res.data;
  },

  async resetPasswordWithOtp({ resetToken, newPassword }: ResetPasswordPayload): Promise<ApiResponse<any>> {
    const res = await api.patch<ApiResponse<any>>(
      `${RECOVERY_BASE_URL}/reset-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${resetToken}` } },
    );
    return res.data;
  },
};

