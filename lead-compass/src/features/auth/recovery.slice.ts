import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { recoveryService, VerifyOtpResponseData } from "./recovery.service";
import { handleApiError } from "@/lib/apiError";

export type RecoveryStep = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export interface RecoveryState {
  step: RecoveryStep;
  email: string;
  resetToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: RecoveryState = {
  step: "EMAIL",
  email: "",
  resetToken: null,
  status: "idle",
  error: null,
  successMessage: null,
};

export const sendForgotOtpThunk = createAsyncThunk(
  "recovery/sendForgotOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await recoveryService.sendForgotOtp({ email });
      return { email, message: response.message || "OTP sent successfully to your email" };
    } catch (e: any) {
      return rejectWithValue(handleApiError(e));
    }
  },
);

export const verifyForgotOtpThunk = createAsyncThunk(
  "recovery/verifyForgotOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await recoveryService.verifyForgotPasswordOtp({ email, otp });
      const data = (response.data || response) as VerifyOtpResponseData;
      if (!data?.resetToken) {
        throw new Error("Reset token not received from server");
      }
      return { resetToken: data.resetToken, message: response.message || "OTP verified successfully" };
    } catch (e: any) {
      return rejectWithValue(handleApiError(e));
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  "recovery/resetPassword",
  async (
    { resetToken, newPassword }: { resetToken: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await recoveryService.resetPasswordWithOtp(resetToken, newPassword);
      return { message: response.message || "Password reset successfully!" };
    } catch (e: any) {
      return rejectWithValue(handleApiError(e));
    }
  },
);

const recoverySlice = createSlice({
  name: "recovery",
  initialState,
  reducers: {
    setRecoveryStep(state, action: PayloadAction<RecoveryStep>) {
      state.step = action.payload;
      state.error = null;
    },
    setRecoveryEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setResetToken(state, action: PayloadAction<string | null>) {
      state.resetToken = action.payload;
    },
    clearRecoveryError(state) {
      state.error = null;
    },
    resetRecoveryState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder.addCase(sendForgotOtpThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(sendForgotOtpThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.email = action.payload.email;
      state.step = "OTP";
      state.successMessage = action.payload.message;
      state.error = null;
    });
    builder.addCase(sendForgotOtpThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = (action.payload as string) || "Failed to send OTP";
    });

    // Verify OTP
    builder.addCase(verifyForgotOtpThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(verifyForgotOtpThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.resetToken = action.payload.resetToken;
      state.step = "RESET";
      state.successMessage = action.payload.message;
      state.error = null;
    });
    builder.addCase(verifyForgotOtpThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = (action.payload as string) || "Invalid OTP code";
    });

    // Reset Password
    builder.addCase(resetPasswordThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(resetPasswordThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.step = "SUCCESS";
      state.resetToken = null;
      state.successMessage = action.payload.message;
      state.error = null;
    });
    builder.addCase(resetPasswordThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = (action.payload as string) || "Failed to reset password";
    });
  },
});

export const {
  setRecoveryStep,
  setRecoveryEmail,
  setResetToken,
  clearRecoveryError,
  resetRecoveryState,
} = recoverySlice.actions;

export default recoverySlice.reducer;

