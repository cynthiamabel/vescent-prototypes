import type { UserRole, UserTier } from "./enums";

export interface UserProfileBrief {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: number;
  state: string | null;
  timezone: string;
  phone: string | null;
  profilePictureUrl: string | null;
  birthdate: string;
  assignedMentorUserId: string | null;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  userTier: UserTier | null;
  assignedMentorUserId: string | null;
  assignedMenteeCount: number;
  timezone: string;
  isActive: boolean;
  accountStatus: string;
  suspended: boolean;
  isVerified: boolean;
  isEmailConfirmed: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
  onboardingResponses: {
    version: string;
    answers: Array<{
      questionId: string;
      questionType?: "single_choice" | "tag_select" | "open_response";
      value?: string | string[] | null;
      displayValue?: string | string[] | null;
      questionPrompt?: string;
      optionId?: string;
      optionLabel?: string;
    }>;
  } | null;
}

export interface UserListPage {
  items: UserListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  state?: string;
  timezone?: string;
  grade?: number;
  phone?: string;
  profilePictureUrl?: string;
}
