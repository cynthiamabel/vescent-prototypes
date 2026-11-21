import type { UserRole, UserTier } from "./enums";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  userTier: UserTier | null;
  profilePictureUrl: string | null;
  grade: number;
  state: string | null;
  timezone: string;
  assignedMentorUserId: string | null;
  onboardingStatus: "complete" | "survey_pending" | "not_required" | string;
  onboardingComplete: boolean;
  accountStatus: "active" | "suspended" | "deactivated" | string;
  suspended: boolean;
  isVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  state?: string;
  grade?: number;
  phone?: string;
  profilePictureUrl?: string;
}

export interface SurveyQuestionOption {
  id: string;
  label: string;
}

export type SurveyQuestionType = "single_choice" | "tag_select" | "open_response";

export interface SurveyQuestion {
  id: string;
  flowOrder: number;
  section: string;
  questionType: SurveyQuestionType;
  prompt: string;
  options: SurveyQuestionOption[];
}

export interface OnboardingSurveyConfig {
  version: string;
  questions: SurveyQuestion[];
}

export interface SurveyAnswerRequest {
  questionId: string;
  questionType: SurveyQuestionType;
  value: string | string[] | null;
}

export interface OnboardingRegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  state: string;
  grade: number;
  phone: string;
  timezone: string;
  userTier: UserTier;
  profilePictureUrl?: string;
  surveyVersion: string;
  surveyAnswers: SurveyAnswerRequest[];
}

export interface AgeAssuranceRequest {
  provider: string;
  ageLowerBound?: number | null;
  ageUpperBound?: number | null;
  ageRange?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface OnboardingProfileRegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  state: string;
  grade: number;
  phone: string;
  timezone: string;
  userTier: UserTier;
  profilePictureUrl?: string;
  ageAssurance?: AgeAssuranceRequest | null;
}

export interface OnboardingSurveySubmitRequest {
  surveyVersion: string;
  surveyAnswers: SurveyAnswerRequest[];
}

export interface MentorApplicationCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface MentorApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  approvedUserId: string | null;
  createdAt: string | null;
}

export interface RegistrationFlag {
  id: number;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  birthdate: string | null;
  state: string | null;
  timezone: string | null;
  grade: number | null;
  phone: string | null;
  userTier: UserTier | null;
  status: "active" | "cleared";
  reason: string;
  reasonDetail: string | null;
  source: string;
  createdAt: string | null;
  clearedAt: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
  portal?: "teen" | "mentor" | undefined;
}

export interface AppleAuthRequest {
  identityToken: string;
  portal?: "teen" | "mentor" | undefined;
}

export interface AppleLinkRequest {
  identityToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
