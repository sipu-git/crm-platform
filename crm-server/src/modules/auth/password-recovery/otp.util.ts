export function generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

export function getOTPExpiryTime(minutesFromNow: number = 10): Date {
    const now = new Date();
    return new Date(now.getTime() + minutesFromNow * 60000);
}

export function isOTPExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
}

