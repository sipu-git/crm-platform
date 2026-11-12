import { brevo, BREVO_SENDER } from "../brevo.config.js";

interface SendTransactionalEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  body,
}: SendTransactionalEmailOptions) {
  return brevo.transactionalEmails.sendTransacEmail({
    sender: BREVO_SENDER,
    to: [{ email: to }],
    subject,
    textContent: body,
  });
}
