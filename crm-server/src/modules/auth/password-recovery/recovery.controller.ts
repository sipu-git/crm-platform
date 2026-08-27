import { Request, Response } from "express";
import { ApiError } from "../../../shared/utils/ApiError";
import { errorResponse, successResponse } from "../../../shared/utils/ApiResponse";
import { ChangePasswordRequestSchema, VerifyChangePasswordOtpSchema } from "./recovery.schema";
import { emailSendService } from "./services/pswd-verfication.service";
import { resetPasswordWithToken } from "./services/pswd-reset.service";

export const recoveryController = {
    sendForgotOtp: async (req: Request, res: Response) => {
        const parsed = ChangePasswordRequestSchema.safeParse(req.body)
        if (!parsed.success) {
            throw ApiError.badRequest(parsed.error.message)
        }
        const infos = parsed.data;
        const response = await emailSendService.sendForGotPasswordOtp(infos.email)
        return res.status(201).json(successResponse("OTP sent successfully to registered email!", response))
    },
    verifyForgotPasswordOtp: async (req: Request, res: Response) => {
        const parsed = VerifyChangePasswordOtpSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                success: false, message: "Validation failed", errors: parsed.error.format()
            });
        }
        const infos = parsed.data;

        const result = await emailSendService.verifyForgotPasswordOtp(infos.email, infos.otp);

        res.status(200).json(successResponse("password verified successfully!", result));
    },
    resetPasswordWithOtpController: async (req: Request, res: Response): Promise<void> => {
        const { newPassword } = req.body;

        if (!newPassword) {
            res.status(400).json(errorResponse('New password is required'));
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json(errorResponse('New password must be at least 8 characters long'));
            return;
        }

        const { email } = req.resetUser!;
        if (!email) {
            res.status(401).json(errorResponse('OTP verification required before resetting password'));
            return;
        }

        const result = await resetPasswordWithToken(email, newPassword);

        res.status(200).json(successResponse('Password reset successfully!', result));
    },

}