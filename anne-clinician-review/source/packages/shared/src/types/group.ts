export interface GroupBrief {
  id: number;
  name: string;
  pictureUrl: string | null;
}

export type GroupType =
  | "direct_mentor"
  | "mentor_circle"
  | "general"
  | "legacy";
export type GroupStatus = "active" | "archived";

export interface GroupMentorLeader {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface GroupMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  userTier: string | null;
  memberRole: "user" | "mentor";
  timezone: string | null;
}

export interface GroupMemberPage {
  items: GroupMember[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface GroupMeetingSchedule {
  id: number;
  label: string | null;
  recurrence: string;
  weekdayUtc: number;
  startTimeUtc: string;
  durationMinutes: number;
  status: string;
  isVideoAvailable: boolean;
}

export interface GroupMeetingRequestApproval {
  mentorUserId: string;
  status: string;
}

export interface GroupMeetingRequestResponse {
  id: number;
  groupId: number;
  proposedByUserId: string;
  label: string | null;
  recurrence: string;
  weekdayUtc: number;
  startTimeUtc: string;
  durationMinutes: number;
  requiresAdminApproval: boolean;
  status: string;
  approvals: GroupMeetingRequestApproval[];
  createdAt: string | null;
}

export interface GroupResponse {
  id: number;
  name: string;
  description: string | null;
  pictureUrl: string | null;
  groupType: GroupType;
  status: GroupStatus;
  isPublic: boolean;
  isPredefined: boolean;
  memberCount: number;
  userCount: number;
  basicUserCount: number;
  premiumUserCount: number;
  freeUserCount: number;
  mentorCount: number;
  weeklyMeetingCount: number;
  timezoneSpread: string | null;
  mentorLeaders: GroupMentorLeader[];
  members: GroupMember[];
  meetingSchedules: GroupMeetingSchedule[];
  pendingMeetingRequests: GroupMeetingRequestResponse[];
  isMember: boolean;
  isPendingMember: boolean;
  callRoomName: string;
  lastActive: string | null;
  createdAt: string;
}

export interface GroupListPage {
  items: GroupResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface GroupCreate {
  name: string;
  description?: string;
  isPublic?: boolean;
  pictureUrl?: string;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  pictureUrl?: string;
}

export interface GroupSetupStatus {
  isReady: boolean;
  reason: string | null;
  message: string | null;
}

export interface MentorCohortCreate {
  name: string;
  mentorUserIds: string[];
}

export interface MentorCohortUpdate {
  name?: string;
  status?: string;
}

export interface MentorCohortResponse {
  id: number;
  name: string;
  status: string;
  group: GroupResponse | null;
  mentors: GroupMentorLeader[];
  createdAt: string | null;
}

export interface MentorCohortPage {
  items: MentorCohortResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface GroupMeetingRequestCreate {
  label?: string;
  recurrence?: string;
  weekdayUtc: number;
  startTimeUtc: string;
  durationMinutes?: number;
}
