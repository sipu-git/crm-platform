import { baseEmailLayout } from "./base.templates.js";

export interface InviteEmailProps {
  fullName: string;
  email: string;
  role: string;
  companyName: string;
  tempPassword: string;
  loginUrl: string;
}

export function inviteEmailTemplate({
  fullName,
  email,
  role,
  companyName,
  tempPassword,
  loginUrl,
}: InviteEmailProps): string {
  const body = `
    <h2 class="title">You've Been Invited to ClearView CRM</h2>
    <p class="text">Hello <strong>${fullName}</strong>,</p>
    <p class="text">
      You have been invited to join <strong>${companyName}</strong> on the ClearView CRM platform as a <strong>${role}</strong>.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Your Account Credentials</h3>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 140px;">Workspace:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Assigned Role:</td>
          <td style="padding: 6px 0;">
            <span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
              ${role}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Login Email:</td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; vertical-align: middle;">Temporary Password:</td>
          <td style="padding: 8px 0;">
            <code style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; font-weight: 700; background-color: #f1f5f9; color: #4f46e5; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;">
              ${tempPassword}
            </code>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
        Sign In to Your Workspace &rarr;
      </a>
    </div>

    <div class="security-box" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e;">
      <strong>⚠️ First-Time Login Notice:</strong> This is a temporary password. For security purposes, please change your password after your initial login from your profile settings.
    </div>

    <p class="text" style="margin-top: 24px; margin-bottom: 0;">
      Best regards,<br />
      <strong>${companyName} Team & ClearView CRM</strong>
    </p>
  `;

  return baseEmailLayout(body);
}

export function inviteEmailSubject(companyName: string): string {
  return `Invitation to join ${companyName} on ClearView CRM`;
}

