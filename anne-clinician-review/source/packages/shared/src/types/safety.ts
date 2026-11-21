export interface SafetyReportCreate {
  targetType: string;
  targetId: string;
  reasonCode: string;
  note?: string | null;
  reportedUserId?: string | null;
}

export interface SafetyReportResponse {
  id: number;
  safetyCaseId: number;
  targetType: string;
  targetId: string;
  reasonCode: string;
  status: string;
  createdAt: string | null;
}

export interface SafetyCaseResponse {
  id: number;
  publicId: string;
  sourceType: string;
  sourceId: string;
  reportedUserId: string | null;
  status: string;
  riskLevel: string;
  priority: string;
  categories: string[];
  recommendedAction: string;
  contentAction: string;
  contentNotice: string | null;
  summary: string | null;
  dueAt: string | null;
  lastSignalAt: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
}

export interface AccountStatusResponse {
  status: string;
  suspended: boolean;
  message: string | null;
  supportEmail: string;
}

export interface AccountSuspendRequest {
  userId: string;
  reasonCode: string;
  note?: string | null;
  safetyCaseId?: number | null;
}

export interface AccountUnsuspendRequest {
  userId: string;
  reasonCode?: string;
  note?: string | null;
  safetyCaseId?: number | null;
}

export interface SafetyRiskRollupResponse {
  id: number;
  protectedUserRef: string;
  riskBucket: string;
  signalCount: number;
  reportCount: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
}

export interface UserBlockCreate {
  blockedUserId: string;
  reasonCode?: string | null;
}

export interface UserBlockResponse {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  blockedAt: string | null;
}

export interface BlockedUserAnalyticsResponse {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  blockCount: number;
}

export interface SafetyUserSummary {
  id: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  userTier: string | null;
  timezone: string | null;
  accountStatus: string;
}

export interface SafetyCircleContext {
  id: number;
  name: string;
  groupType: string;
  mentors: SafetyUserSummary[];
}

export interface SafetyVideoParticipant {
  user: SafetyUserSummary | null;
  providerUid: number | null;
  role: string;
  joinedAt: string | null;
  leftAt: string | null;
}

export interface SafetyVideoContext {
  roomId: number;
  roomType: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  participants: SafetyVideoParticipant[];
}

export interface SafetyReviewRow {
  id: string;
  caseId: number | null;
  sourceSystem: "report" | "safety" | "video" | "registration" | string;
  sourceType: string;
  sourceId: string;
  risk: string;
  category: string;
  surface: string;
  status: string;
  contextPreview: string | null;
  detector: string | null;
  confidence: number | null;
  actor: SafetyUserSummary | null;
  reporter: SafetyUserSummary | null;
  createdAt: string | null;
  lastSeenAt: string | null;
}

export interface SafetyReviewPage {
  items: SafetyReviewRow[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface SafetyReviewDetailContent {
  text: string | null;
  imageUrl: string | null;
  hasRetainedImage: boolean;
  evidenceAvailable: boolean;
}

export interface SafetyReviewerActionSummary {
  id: number;
  action: string;
  reasonCode: string;
  actorUserId: string | null;
  targetUserId: string | null;
  createdAt: string | null;
}

export interface SafetyReviewDetail {
  row: SafetyReviewRow;
  content: SafetyReviewDetailContent | null;
  actor: SafetyUserSummary | null;
  reporter: SafetyUserSummary | null;
  circle: SafetyCircleContext | null;
  video: SafetyVideoContext | null;
  auditEvents: Array<Record<string, unknown>>;
  actions: SafetyReviewerActionSummary[];
}

export interface SafetyEvidenceAccessResponse {
  url: string;
  expiresInSeconds: number;
}

export interface SafetyHighRiskCategoryCount {
  category: string;
  count: number;
}

export interface SafetyHighRiskUserRow {
  user: SafetyUserSummary;
  total: number;
  posts: number;
  replies: number;
  messages: number;
  images: number;
  video: number;
  reports: number;
  topCategories: SafetyHighRiskCategoryCount[];
  lastSeenAt: string | null;
}

export interface SafetyHighRiskUsersPage {
  items: SafetyHighRiskUserRow[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}
