import { useMutation } from "@tanstack/react-query";
import { recoveryApi } from "../apis/recovery.api";
import { recoveryKeys } from "../keys/recovery.keys";
import type {
  ApiResponse,
  ResetPasswordPayload,
  SendForgotOtpPayload,
  VerifyForgotOtpPayload,
  VerifyOtpResponseData,
} from "../types/recovery.types";

export function useSendForgotOtp() {
  return useMutation<ApiResponse<string>, Error, SendForgotOtpPayload>({
    mutationKey: recoveryKeys.sendOtp,
    mutationFn: (payload) => recoveryApi.sendForgotOtp(payload),
  });
}

export function useVerifyForgotOtp() {
  return useMutation<ApiResponse<VerifyOtpResponseData>, Error, VerifyForgotOtpPayload>({
    mutationKey: recoveryKeys.verifyOtp,
    mutationFn: (payload) => recoveryApi.verifyForgotPasswordOtp(payload),
  });
}

export function useResetPasswordWithOtp() {
  return useMutation<ApiResponse<any>, Error, ResetPasswordPayload>({
    mutationKey: recoveryKeys.resetPassword,
    mutationFn: (payload) => recoveryApi.resetPasswordWithOtp(payload),
  });
}

