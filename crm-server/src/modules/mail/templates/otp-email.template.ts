import { baseEmailLayout } from "./base.templates.js";

export type OtpEmailType = "FORGOT_PASSWORD" | "CHANGE_PASSWORD";

export function otpEmailTemplate(otp: string, type: OtpEmailType): string {
    const title = type === "FORGOT_PASSWORD" ? "Reset Your Password" : "Change Your Password";
    const message =
        type === "FORGOT_PASSWORD"
            ? "We received a request to reset the password for your ClearView CRM account. Use the One-Time Password (OTP) below to proceed:"
            : "We received a request to change the password for your ClearView CRM account. Use the One-Time Password (OTP) below to proceed:";
    const actionLabel = type === "FORGOT_PASSWORD" ? "password reset" : "password change";

    const body = `
      <h2 class="title">${title}</h2>
      <p class="text">Hello,</p>
      <p class="text">${message}</p>
      <div class="otp-container">
        <div class="otp-code">${otp}</div>
        <p class="otp-expiry">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
      </div>
      <div class="security-box">
        <strong>🔒 Security Notice:</strong> Never share this OTP with anyone. ClearView staff will never ask for your verification code via email, phone, or message.
      </div>
      <p class="text">If you did not request a ${actionLabel}, you can safely disregard this email or contact your workspace administrator.</p>
      <p class="text" style="margin-top: 24px; margin-bottom: 0;">
        Best regards,<br />
        <strong>ClearView Security Team</strong>
      </p>`;

    return baseEmailLayout(body);
}

export function otpEmailSubject(type: OtpEmailType): string {
    return type === "FORGOT_PASSWORD"
        ? "Password Reset Code - ClearView CRM"
        : "Security Verification Code - ClearView CRM";
}