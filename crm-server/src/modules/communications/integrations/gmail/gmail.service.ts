import { google } from 'googleapis';
import { prisma } from '../../../../../lib/prisma.js';
import { getAuthorizedClient } from './gmail.config.js';
import { decrypt } from './utils/encryption.util.js';
import { ApiError } from '../../../../shared/utils/ApiError.js';
import { CommunicationChannel, CommunicationDirection, CommunicationStatus, MessageType } from '../../../../../generated/prisma/enums.js';
import { extractBody, parseFromEmail } from './utils/parser.util.js';

export interface SendGmailOptions {
  userId: string;
  to: string;
  subject: string;
  body: string;
  /** thread to reply in (optional) */
  threadId?: string;
}

export interface GmailAccountStatus {
  connected: boolean;
  email?: string;
  id?: string;
}

export const gmailService = {
  /**
   * Resolve the active EmailAccount for a user.
   * Throws 400 if none is connected.
   */
  async getAccount(userId: string) {
    const account = await prisma.emailAccount.findFirst({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' },
    });
    if (!account) {
      throw new ApiError(
        400,
        'No Gmail account connected. Connect your Gmail account first via Settings → Email.',
      );
    }
    return account;
  },

  /** Return connected Gmail account info without throwing. */
  async getStatus(userId: string): Promise<GmailAccountStatus> {
    const account = await prisma.emailAccount.findFirst({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' },
    });
    if (!account) return { connected: false };
    return { connected: true, email: account.email, id: account.id };
  },

  /** List connected Gmail accounts for a user. */
  async listAccounts(userId: string) {
    return prisma.emailAccount.findMany({
      where: { user_id: userId },
      select: { id: true, email: true, is_active: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
  },

  /** Disconnect (deactivate) a Gmail account. */
  async disconnect(userId: string, accountId: string) {
    const account = await prisma.emailAccount.findFirst({
      where: { id: accountId, user_id: userId },
    });
    if (!account) throw new ApiError(404, 'Email account not found');

    await prisma.emailAccount.update({
      where: { id: accountId },
      data: { is_active: false },
    });
    return { disconnected: true };
  },

  /**
 * Fetch recent inbox messages and log any new ones (not yet synced)
 * as INBOUND Communications rows, matched to a Lead by contact email.
 */
  async syncInbox(userId: string, tenantId: string, maxResults = 20) {
    const account = await this.getAccount(userId);
    const refreshToken = decrypt(account.refresh_token);
    const authClient = getAuthorizedClient(refreshToken);
    const gmail = google.gmail({ auth: authClient, version: 'v1' });

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['INBOX'],
    });

    const messages = listRes.data.messages ?? [];
    if (messages.length === 0) return { synced: 0, skipped: 0 };

    let synced = 0;
    let skipped = 0;

    for (const m of messages) {
      if (!m.id) continue;

      // Skip if we've already logged this Gmail message.
      const already = await prisma.communications.findUnique({
        where: { provider_message_id: m.id },
      });
      if (already) {
        skipped++;
        continue;
      }

      const { data: msg } = await gmail.users.messages.get({
        userId: 'me',
        id: m.id,
        format: 'full',
      });

      const headers: Record<string, string> = {};
      for (const h of msg.payload?.headers ?? []) {
        if (h.name) headers[h.name] = h.value ?? '';
      }

      const fromEmail = parseFromEmail(headers['From'] ?? '');
      if (!fromEmail || fromEmail === account.email.toLowerCase()) {
        skipped++;
        continue;
      }

      // Match sender to an existing Lead via its Contact's email.
      const lead = await prisma.leads.findFirst({
        where: { tenant_id: tenantId, contact: { email: fromEmail } },
        select: { id: true, tenant_id: true, company_id: true, contact_id: true },
      });

      if (!lead) {
        // No matching lead — skip for now (could log unassigned later).
        skipped++;
        continue;
      }

      const body = extractBody(msg.payload) || msg.snippet || '';

      await prisma.communications.create({
        data: {
          tenant_id: lead.tenant_id,
          lead_id: lead.id,
          contact_id: lead.contact_id,
          company_id: lead.company_id,
          channel: CommunicationChannel.EMAIL,
          direction: CommunicationDirection.INBOUND,
          message_type: MessageType.TEXT,
          subject: headers['Subject'] ?? '(No Subject)',
          body,
          status: CommunicationStatus.DELIVERED,
          provider_message_id: m.id,
        },
      });

      synced++;
    }

    return { synced, skipped };
  },

  async sendEmail({ userId, to, subject, body, threadId }: SendGmailOptions) {
    const account = await this.getAccount(userId);

    const refreshToken = decrypt(account.refresh_token);
    const authClient = getAuthorizedClient(refreshToken);
    const gmail = google.gmail({ auth: authClient, version: 'v1' });

    // Build RFC 2822-compliant message
    const messageParts = [
      `From: ${account.email}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body,
    ];
    const rawMessage = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        ...(threadId ? { threadId } : {}),
      },
    });

    return response.data;
  },

  /**
   * Fetch recent emails from the connected inbox.
   */
  async listInbox(userId: string, maxResults = 20) {
    const account = await this.getAccount(userId);
    const refreshToken = decrypt(account.refresh_token);
    const authClient = getAuthorizedClient(refreshToken);
    const gmail = google.gmail({ auth: authClient, version: 'v1' });

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['INBOX'],
    });

    const messages = listRes.data.messages ?? [];
    if (messages.length === 0) return [];

    // Fetch message metadata in parallel (max 20)
    const detailed = await Promise.allSettled(
      messages.slice(0, maxResults).map((m) =>
        gmail.users.messages.get({
          userId: 'me',
          id: m.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        }),
      ),
    );

    return detailed
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => {
        const msg = r.value.data;
        const headers: Record<string, string> = {};
        for (const h of msg.payload?.headers ?? []) {
          if (h.name) headers[h.name] = h.value ?? '';
        }
        return {
          id: msg.id,
          threadId: msg.threadId,
          subject: headers['Subject'] ?? '(No Subject)',
          from: headers['From'] ?? '',
          to: headers['To'] ?? '',
          date: headers['Date'] ?? '',
          snippet: msg.snippet ?? '',
          labelIds: msg.labelIds ?? [],
        };
      });
  },
};
