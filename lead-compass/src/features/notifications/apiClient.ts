import { api } from "@/api/client";
import type { Notification, RegisterDeviceTokenInput } from "./types";

const BASE = "/notifications";

// GET / — unread only
export const listUnreadNotifications = async () =>
  (await api.get<Notification[]>(BASE)).data;

// GET /all — full history
export const listAllNotifications = async () =>
  (await api.get<Notification[]>(`${BASE}/all`)).data;

// PATCH /:id/read
export const markNotificationRead = async (id: string) => {
  await api.patch(`${BASE}/${id}/read`);
  return id;
};

// PATCH /read-all
export const markAllNotificationsRead = async () => {
  await api.patch(`${BASE}/read-all`);
  return true;
};

export const removeNotification = async (messageId?: string[]) => {
  await api.delete(`${BASE}/bulk-delete`, { data: messageId });
  return true;
};

// POST /device-tokens
export const registerDeviceToken = async (input: RegisterDeviceTokenInput) => {
  await api.post(`${BASE}/device-tokens`, input);
  return input.token;
};

// DELETE /device-tokens
export const unregisterDeviceToken = async (token: string) => {
  await api.delete(`${BASE}/device-tokens`, { data: { token } });
  return token;
};