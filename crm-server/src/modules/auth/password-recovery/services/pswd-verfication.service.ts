import { prisma } from "../../../../../lib/prisma";
import { checkRateLimit, resetRateLimit, storeOtp, verfiyOtp } from "../../../../shared/redis/store-otp";
import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiError } from "../../../../shared/utils/ApiError";
import { generateOTP } from "../otp.util";
import { sendOtpEmail } from "../../../mail/services/otp-email.service";
import { env } from "../../../../shared/configs/env.js";

export const emailSendService = {
    async sendForGotPasswordOtp(email: string): Promise<string> {
        try {
            await checkRateLimit(email)
            const user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            })
            if (!user) {
                throw ApiError.notFound('User with this email does not exist');
            }
            const otp = generateOTP()
            await storeOtp(email, otp, 'FORGOT_PASSWORD')
            await sendOtpEmail({ email, otp, type: "FORGOT_PASSWORD" })
            return otp;
        } catch (error) {
            throw error;
        }
    },
    async verifyForgotPasswordOtp(email: string, otp: string):
        Promise<{ isValid: boolean; userId: string, resetToken: string }> {
        try {
            const verify = await verfiyOtp(email, otp, "FORGOT_PASSWORD")
            if (!verify.isValid) {
                throw ApiError.badRequest('Invalid OTP');
            }
            const findUser = await prisma.user.findUnique({
                where: {
                    email
                }
            })
            if (!findUser) {
                throw ApiError.notFound('User not found');
            }
            await resetRateLimit(email)

            const resetToken = jwt.sign(
                {
                    userId: findUser.id,
                    email: findUser.email,
                },
                env.jwt.accessSecret,
                { expiresIn: "10m" }
            );
            return {
                isValid: true,
                resetToken,
                userId: findUser.id
            }

        } catch (error) {
            throw error;
        }
    }
}