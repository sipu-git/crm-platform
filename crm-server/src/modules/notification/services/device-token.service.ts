import { deviceTokenRepository } from "../repository/device-token.repository";

export const deviceTokenService = {
  async register(tenantId: string, userId: string, token: string) {
    if (!token || !token.trim()) {
      throw new Error("token is required");
    }
    return deviceTokenRepository.upsert(tenantId, userId, token);
  },

  async unregister(token: string) {
    if (!token || !token.trim()) {
      throw new Error("token is required");
    }
    return deviceTokenRepository.remove(token);
  },
};
