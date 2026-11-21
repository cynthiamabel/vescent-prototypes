import { apiRequest } from "./client";
import type { NotificationSettings, NotificationSettingsUpdate } from "../types/notification";

const NOTIFICATION_CATEGORY_KEYS: Array<keyof NotificationSettingsUpdate> = [
  "notifyRepliesEnabled",
  "notifyReactionsEnabled",
  "notifyMessagesEnabled",
  "notifyMeetingsEnabled",
  "notifyCallsEnabled",
  "notifyAccountEnabled",
  "notifyNudgesEnabled",
];

export function normalizeNotificationSettingsPatch(
  current: NotificationSettings | null | undefined,
  patch: NotificationSettingsUpdate,
): NotificationSettingsUpdate {
  if (patch.notificationsEnabled !== undefined) {
    return NOTIFICATION_CATEGORY_KEYS.reduce<NotificationSettingsUpdate>(
      (next, key) => ({ ...next, [key]: patch.notificationsEnabled }),
      { ...patch, pushNotificationsEnabled: patch.notificationsEnabled },
    );
  }

  const categoryPatch = { ...patch };
  delete categoryPatch.pushNotificationsEnabled;

  if (!current) return categoryPatch;

  const next = { ...current, ...categoryPatch };
  if (NOTIFICATION_CATEGORY_KEYS.some((key) => key in categoryPatch)) {
    const enabled = NOTIFICATION_CATEGORY_KEYS.every((key) => Boolean(next[key]));
    return {
      ...categoryPatch,
      notificationsEnabled: enabled,
      pushNotificationsEnabled: enabled,
    };
  }

  return categoryPatch;
}

export const getUserSettings = (): Promise<NotificationSettings> =>
  apiRequest("/api/v1/user-settings/");

export const updateUserSettings = (
  body: NotificationSettingsUpdate,
): Promise<NotificationSettings> =>
  apiRequest("/api/v1/user-settings/", {
    method: "PUT",
    body: JSON.stringify(body),
  });
