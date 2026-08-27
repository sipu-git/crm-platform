import { brevo, BREVO_SENDER } from "../brevo.config.js";
import { otpEmailTemplate, otpEmailSubject, type OtpEmailType } from "../templates/otp-email.template.js";

interface SendOtpEmailProps {
  email: string;
  otp: string;
  type: OtpEmailType;
}

export async function sendOtpEmail({ email, otp, type }: SendOtpEmailProps): Promise<boolean> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: otpEmailSubject(type),
      htmlContent: otpEmailTemplate(otp, type),
      sender: BREVO_SENDER,
      to: [{ email }],
    });

    console.log(`OTP email sent to ${email}, messageId: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}