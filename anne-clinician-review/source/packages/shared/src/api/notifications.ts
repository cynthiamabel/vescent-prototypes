import { apiRequest } from "./client";
import type {
  NotificationCount,
  NotificationListPage,
  NotificationResponse,
  PushDeviceTokenRequest,
  PushDeviceTokenResponse,
} from "../types/notification";

interface PageParams {
  page?: number;
  pageSize?: number;
}

export const getNotifications = ({
  page = 1,
  pageSize = 20,
}: PageParams = {}): Promise<NotificationListPage> =>
  apiRequest(`/api/v1/notifications/?page=${page}&page_size=${pageSize}`);

export const getNotification = (id: number): Promise<NotificationResponse> =>
  apiRequest(`/api/v1/notifications/${id}`);

export const getNotificationCount = (): Promise<NotificationCount> =>
  apiRequest("/api/v1/notifications/count");

/** @deprecated use getNotificationCount */
export const getUnreadCount = getNotificationCount;

export const markAllRead = (): Promise<{ message: string }> =>
  apiRequest("/api/v1/notifications/read-all", { method: "PUT" });

export const markRead = (id: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/notifications/${id}/read`, { method: "PUT" });

export const markConversationRead = (
  conversationSid: string,
): Promise<{ message: string }> =>
  apiRequest(`/api/v1/notifications/conversations/${conversationSid}/read`, {
    method: "PUT",
  });

export const markOpened = (id: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/notifications/${id}/opened`, { method: "PUT" });

export const registerPushDeviceToken = (
  body: PushDeviceTokenRequest,
): Promise<PushDeviceTokenResponse> =>
  apiRequest("/api/v1/notifications/device-tokens", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const unregisterPushDeviceToken = (token: string): Promise<{ message: string }> =>
  apiRequest("/api/v1/notifications/device-tokens/unregister", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
