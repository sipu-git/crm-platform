import { notificationService } from "./notification.service.js";
import type { Notification } from "../../../generated/prisma/client.js"; // adjust path if your generated client export differs
import { messaging } from "./integrations/firebase-admin.js";
import { deviceTokenRepository } from "./device-token/device-token.repository.js";

export async function sendPush(tenantId: string, notification: Notification) {
  const tokens = await deviceTokenRepository.findByUser(tenantId, notification.recipient_id);
  console.log("[sendPush] tokens found:", tokens.length, "for user", notification.recipient_id);

  if (tokens.length === 0) {
    return notificationService.markFailed(
      tenantId,
      notification.id,
      "No registered device tokens for user"
    );
  }

  try {
    const response = await messaging.sendEachForMulticast({
      data: {
        notificationId: notification.id,
        title: notification.subject,
        body: notification.message,
        url: "/notifications",
      },
      webpush: { headers: { Urgency: "high" } },
      tokens: tokens.map((t) => t.token),
    });
    console.log("[sendPush] FCM response:", JSON.stringify(response, null, 2));
    // prune tokens FCM says are dead
    const deadTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          deadTokens.push(tokens[i].token);
        }
      }
    });
    if (deadTokens.length > 0) {
      await deviceTokenRepository.removeMany(deadTokens);
    }

    if (response.successCount === 0) {
      const firstError = response.responses.find((r) => !r.success)?.error?.message;
      return notificationService.markFailed(
        tenantId,
        notification.id,
        firstError ?? "FCM send failed for all tokens"
      );
    }

    const messageId = response.responses.find((r) => r.success)?.messageId ?? "";
    return notificationService.markSent(tenantId, notification.id, messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected FCM send failure";
    console.log("[sendPush] FCM call threw:", message);
    return notificationService.markFailed(tenantId, notification.id, message);
  }
}
