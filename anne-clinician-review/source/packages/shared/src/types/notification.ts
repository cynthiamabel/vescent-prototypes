export interface NotificationResponse {
  id: number;
  postId: number | null;
  replyId: number | null;
  groupId: number | null;
  notificationText: string;
  isRead: boolean;
  notificationType: string;
  title: string | null;
  body: string | null;
  targetType: string | null;
  targetId: string | null;
  actorUserId: string | null;
  metadataJson: Record<string, unknown> | null;
  readAt: string | null;
  openedAt: string | null;
  pushSentAt: string | null;
  pushFailedAt: string | null;
  pushError: string | null;
  createdAt: string;
}

export interface NotificationCount {
  count: number;
}

export interface NotificationListPage {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface PushDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId?: string | null;
  appVersion?: string | null;
}

export interface PushDeviceTokenResponse extends PushDeviceTokenRequest {
  id: number;
  isActive: boolean;
  lastSeenAt: string | null;
}

export interface NotificationSettings {
  id: number;
  userProfileId: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotificationsEnabled: boolean;
  notifyRepliesEnabled: boolean;
  notifyReactionsEnabled: boolean;
  notifyMessagesEnabled: boolean;
  notifyMeetingsEnabled: boolean;
  notifyCallsEnabled: boolean;
  notifyAccountEnabled: boolean;
  notifyNudgesEnabled: boolean;
}

export type NotificationSettingsUpdate = Partial<
  Omit<NotificationSettings, "id" | "userProfileId">
>;
