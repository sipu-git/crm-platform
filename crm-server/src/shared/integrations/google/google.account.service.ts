import { prisma } from '../../../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getAuthorizedClient } from './google.config.js';
import { decryptToken } from './google.encryption.js';

export interface GoogleAccountStatus {
  connected: boolean;
  email?: string;
  id?: string;
}

export const googleAccountService = {
  /**
   * Get the active connected Google EmailAccount for a user.
   * Throws ApiError(400) if no active account is connected.
   */
  async getActiveAccount(userId: string) {
    const account = await prisma.emailAccount.findFirst({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    if (!account) {
      throw new ApiError(
        400,
        'No Google account connected. Please connect your Google Account first via Settings → Email / Integrations.'
      );
    }

    return account;
  },

  /**
   * Return authorized OAuth2Client for the active Google account of a user.
   */
  async getAuthorizedOAuth2Client(userId: string) {
    const account = await this.getActiveAccount(userId);
    const refreshToken = decryptToken(account.refresh_token);
    return getAuthorizedClient(refreshToken);
  },

  /**
   * Check connection status of a user's Google account without throwing.
   */
  async getStatus(userId: string): Promise<GoogleAccountStatus> {
    const account = await prisma.emailAccount.findFirst({
      where: { user_id: userId, is_active: true },
      orderBy: { created_at: 'desc' },
    });

    if (!account) return { connected: false };
    return { connected: true, email: account.email, id: account.id };
  },

  /**
   * List all connected Google accounts for a user.
   */
  async listAccounts(userId: string) {
    return prisma.emailAccount.findMany({
      where: { user_id: userId },
      select: { id: true, email: true, is_active: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
  },

  /**
   * Disconnect a Google account by setting is_active = false.
   */
  async disconnectAccount(userId: string, accountId: string) {
    const account = await prisma.emailAccount.findFirst({
      where: { id: accountId, user_id: userId },
    });
    if (!account) throw new ApiError(404, 'Google account not found');

    await prisma.emailAccount.update({
      where: { id: accountId },
      data: { is_active: false },
    });

    return { disconnected: true };
  },
};

