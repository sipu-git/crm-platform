import { ApiError } from "../utils/ApiError";
import redis from "./redis";

const otp_expiry = 600;
const otp_rate_limit = 300;
const max_request = 4;

export type OtpType = 'FORGOT_PASSWORD' | 'CHANGE_PASSWORD' | 'SIGNUP';

interface OtpData {
    otp: string;
    email: string;
    type: OtpType;
    createdAt: number;
    expiresAt: number;
}

export async function storeOtp(email: string, otp: string, type: OtpType): Promise<boolean> {
    try {
        const key = `OTP:${type}:${email}`;
        const otpData: OtpData = {
            otp, email, type,
            createdAt: Date.now(),
            expiresAt: Date.now() + otp_expiry * 1000,
        }
        await redis.setEx(key, otp_expiry, JSON.stringify(otpData))
        return true;
    } catch (error) {
        console.error('Error storing OTP in Redis:', error);
        throw ApiError.conflict('Failed to store OTP');
    }
}

export async function verfiyOtp(email: string, otp: string, type: OtpType): Promise<{ isValid: boolean; data?: OtpData }> {
    try {
        const key = `OTP:${type}:${email}`;
        const otpData = await redis.get(key)
        if (!otpData) {
            throw ApiError.notFound('OTP not found or expired');
        }
        const parsedData: OtpData = JSON.parse(otpData);
        if (parsedData.otp !== otp) {
            throw ApiError.badRequest('Invalid OTP');
        }
        if (Date.now() > parsedData.expiresAt) {
            await deleteOTP(email, type);
            throw ApiError.badRequest('OTP has expired');
        }
        await deleteOTP(email, type);
        return {
            isValid: true,
            data: parsedData,
        };

    } catch (error) {
        throw error;
    }
}

export async function deleteOTP(
    email: string,
    type: OtpType
): Promise<boolean> {
    try {
        const key = `OTP:${type}:${email}`;
        await redis.del(key);
        console.log(`OTP deleted from Redis for ${email} (${type})`);
        return true;
    } catch (error) {
        console.error('Error deleting OTP from Redis:', error);
        return false;
    }
}

export async function checkRateLimit(email: string): Promise<boolean> {
    try {
        const key = `OTP:ATTEMPTS:${email}`;
        const attempts = await redis.incr(key)

        if (attempts === 1) {
            await redis.expire(key, otp_rate_limit);
        }
        if (attempts > max_request) {
            throw ApiError.badRequest(`Too many OTP requests. Please try again later. (${attempts}/${max_request})`);
        }
        return true;
    } catch (error) {
        throw error;
    }
}

export async function resetRateLimit(email: string): Promise<boolean> {
    try {
        const key = `OTP:ATTEMPTS:${email}`;
        await redis.del(key);
        console.log(`Rate limit reset for ${email}`);
        return true;
    } catch (error) {
        console.error('Error resetting rate limit:', error);
        return false;
    }
}

export async function getRemainingAttempts(email: string): Promise<number> {
    try {
        const key = `OTP:ATTEMPTS:${email}`;
        const attempts = await redis.get(key);
        const currentAttempts = parseInt(attempts || '0', 10);
        return Math.max(0, max_request - currentAttempts);
    } catch (error) {
        console.error('Error getting remaining attempts:', error);
        return max_request;
    }
}

export async function getOTPTTL(email: string, type: OtpType): Promise<number> {
    try {
        const key = `OTP:${type}:${email}`;
        const ttl = await redis.ttl(key);
        return ttl > 0 ? ttl : 0;
    } catch (error) {
        console.error('Error getting OTP TTL:', error);
        return 0;
    }
}

export async function clearAllOTPs(email: string): Promise<boolean> {
    try {
        const keys = await redis.keys(`OTP:*:${email}`);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Cleared ${keys.length} OTPs for ${email}`);
        }
        return true;
    } catch (error) {
        console.error('Error clearing OTPs:', error);
        return false;
    }
}