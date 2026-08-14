import type { EntityState } from "@reduxjs/toolkit";
export const NOTIFICATION_STATUSES = [
  "PENDING",
  "SENT",
  "DELIVERED",
  "FAILED",
] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface RegisterDeviceTokenInput {
  token: string;
  platform: "ios" | "android" | "web";
  deviceId?: string;
}
export interface Notification {
  id: string;
  tenant_id: string;
  recipient_id: string;
  channel: string;
  subject: string;
  message: string;
  status: NotificationStatus;
  external_ref: string;
  isRead: boolean;
  error_message: string;
  sent_at: string;
  created_at: string;

  recipient?: { id: string; full_name: string } | null;
}

export interface NotificationFilters {
  isRead?: boolean;
  status?: NotificationStatus;
  channel?: string;
}

export type NotificationSliceStatus = "idle" | "loading" | "succeeded" | "failed";

export interface NotificationExtraState {
  status: NotificationSliceStatus;
  error: string | null;
}

export type NotificationState = EntityState<Notification, string> & NotificationExtraState;

export const notificationInitialExtraState: NotificationExtraState = {
  status: "idle",
  error: null,
};