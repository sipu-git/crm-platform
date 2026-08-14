import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/api/client";
import { requestPushToken, subscribeToForegroundMessages } from "./firebase";

export function PushNotificationManager({ authenticated }: { authenticated: boolean }) {
  useEffect(() => {
    if (!authenticated) return;

    let unsubscribe = () => undefined;
    void (async () => {
      try {
        const token = await requestPushToken();
        if (token) await api.post("/notifications/device-tokens", { token });
        unsubscribe = await subscribeToForegroundMessages((payload) => {
          toast(payload.data?.title ?? "New notification", {
            description: payload.data?.body,
          });
        });
      } catch (error) {
        // Permission denials and unsupported browsers must not affect CRM use.
        console.warn("Web push registration failed", error);
      }
    })();

    return () => unsubscribe();
  }, [authenticated]);

  return null;
}
