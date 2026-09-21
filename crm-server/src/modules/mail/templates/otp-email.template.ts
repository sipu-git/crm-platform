import { baseEmailLayout } from "./base.templates.js";

export type OtpEmailType = "FORGOT_PASSWORD" | "CHANGE_PASSWORD" | "SIGNUP";

export function otpEmailTemplate(otp: string, type: OtpEmailType): string {
    let title = "Reset Your Password";
    let message = "We received a request to reset the password for your ClearView CRM account. Use the One-Time Password (OTP) below to proceed:";
    let actionLabel = "password reset";

    if (type === "CHANGE_PASSWORD") {
        title = "Change Your Password";
        message = "We received a request to change the password for your ClearView CRM account. Use the One-Time Password (OTP) below to proceed:";
        actionLabel = "password change";
    } else if (type === "SIGNUP") {
        title = "Verify Your Email Address";
        message = "Welcome to ClearView CRM! Use the One-Time Password (OTP) below to verify your email address and complete your workspace setup:";
        actionLabel = "account registration";
    }

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
      <p class="text">If you did not request ${actionLabel}, you can safely disregard this email.</p>
      <p class="text" style="margin-top: 24px; margin-bottom: 0;">
        Best regards,<br />
        <strong>ClearView Onboarding Team</strong>
      </p>`;

    return baseEmailLayout(body);
}

export function otpEmailSubject(type: OtpEmailType): string {
    if (type === "FORGOT_PASSWORD") return "Password Reset Code - ClearView CRM";
    if (type === "CHANGE_PASSWORD") return "Security Verification Code - ClearView CRM";
    return "Verify Your Email - ClearView CRM";
}