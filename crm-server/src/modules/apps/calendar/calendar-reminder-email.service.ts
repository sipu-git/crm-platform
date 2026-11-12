import { brevo, BREVO_SENDER } from "../../mail/brevo.config.js";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendCalendarReminderEmail(input: {
  email: string;
  name: string;
  summary: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  timeZone: string;
}) {
  const formattedStart = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: input.timeZone,
  }).format(input.startsAt);
  const details = [
    `<p><strong>When:</strong> ${escapeHtml(formattedStart)}</p>`,
    input.location
      ? `<p><strong>Where:</strong> ${escapeHtml(input.location)}</p>`
      : "",
    input.description ? `<p>${escapeHtml(input.description)}</p>` : "",
  ]
    .filter(Boolean)
    .join("");

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `Reminder: ${input.summary} is tomorrow`,
    htmlContent: `<div><h2>Upcoming calendar event</h2><p>This is a reminder for an event in your workspace.</p><p><strong>${escapeHtml(input.summary)}</strong></p>${details}</div>`,
    sender: BREVO_SENDER,
    to: [{ email: input.email, name: input.name }],
  });
}
