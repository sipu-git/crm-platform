import { brevo, BREVO_SENDER } from "../brevo.config.js";
import { inviteEmailTemplate, inviteEmailSubject, type InviteEmailProps } from "../templates/invite-email.template.js";

export async function sendInviteEmail(props: InviteEmailProps): Promise<boolean> {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: inviteEmailSubject(props.companyName),
      htmlContent: inviteEmailTemplate(props),
      sender: BREVO_SENDER,
      to: [{ email: props.email, name: props.fullName }],
    });

    console.log(`Invite email sent to ${props.email}, messageId: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending invite email:", error);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `\n[DEV ONLY] Invitation created for ${props.email} (${props.role}) in ${props.companyName}.\n`
      );
      return true;
    }
    return false;
  }
}
