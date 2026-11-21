export interface UsageEventCreate {
  eventType: string;
  source?: string;
  sessionId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  groupId?: number | null;
  durationSeconds?: number | null;
  value?: number | null;
  metadataJson?: Record<string, unknown> | null;
  occurredAt?: string | null;
}

export interface UsageEventResponse extends Required<
  Omit<UsageEventCreate, "occurredAt">
> {
  id: number;
  userId: string;
  occurredAt: string;
}

export interface UsageDailyStats {
  userId: string;
  statDate: string;
  timezone: string | null;
  appSessions: number;
  activeSeconds: number;
  callSeconds: number;
  messagesSent: number;
  conversationsStarted: number;
  postsCreated: number;
  repliesCreated: number;
  reactionsSent: number;
  notificationsOpened: number;
  pushNotificationsSent: number;
  groupViews: number;
  callJoins: number;
  meetingRequestsCreated: number;
  sharpenOpens: number;
}

export interface UsageSummary extends Omit<
  UsageDailyStats,
  "userId" | "statDate" | "timezone"
> {
  days: number;
  activeUsers: number;
}

export interface UsageInvestorStats {
  totalUsers: number;
  totalActiveUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageDailyAppMinutesPerActiveUser: number;
  totalAppHours: number;
  appSessions30d: number;
  posts30d: number;
  replies30d: number;
  messages30d: number;
  callHours30d: number;
  notificationsOpened30d: number;
}
