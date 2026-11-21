import { apiRequest } from "./client";
import type {
  AuthResponse,
  AuthUser,
  AppleAuthRequest,
  AppleLinkRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MentorApplication,
  MentorApplicationCreate,
  OnboardingProfileRegisterRequest,
  OnboardingRegisterRequest,
  OnboardingSurveySubmitRequest,
  OnboardingSurveyConfig,
  RefreshTokenRequest,
  RegistrationFlag,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/auth";

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiRequest("/api/v1/account/authenticate", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const register = (data: RegisterRequest): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getOnboardingSurvey = (): Promise<OnboardingSurveyConfig> =>
  apiRequest("/api/v1/account/onboarding/survey");

export const registerOnboarding = (
  data: OnboardingRegisterRequest,
): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/register/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const registerOnboardingProfile = (
  data: OnboardingProfileRegisterRequest,
): Promise<{ message: string; userId: string }> =>
  apiRequest("/api/v1/account/register/onboarding-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const submitOnboardingSurvey = (
  data: OnboardingSurveySubmitRequest,
): Promise<AuthUser> =>
  apiRequest("/api/v1/account/onboarding/survey-responses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createMentorApplication = (
  data: MentorApplicationCreate,
): Promise<MentorApplication> =>
  apiRequest("/api/v1/account/mentor-applications", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listMentorApplications = (
  status = "pending",
): Promise<MentorApplication[]> =>
  apiRequest(
    `/api/v1/account/admin/mentor-applications?status=${encodeURIComponent(status)}`,
  );

export const approveMentorApplication = (
  id: number,
): Promise<MentorApplication> =>
  apiRequest(`/api/v1/account/admin/mentor-applications/${id}/approve`, {
    method: "POST",
  });

export const rejectMentorApplication = (
  id: number,
): Promise<MentorApplication> =>
  apiRequest(`/api/v1/account/admin/mentor-applications/${id}/reject`, {
    method: "POST",
  });

export const listRegistrationFlags = (
  status = "active",
): Promise<RegistrationFlag[]> =>
  apiRequest(
    `/api/v1/account/admin/registration-flags?status=${encodeURIComponent(status)}`,
  );

export const clearRegistrationFlag = (id: number): Promise<RegistrationFlag> =>
  apiRequest(`/api/v1/account/admin/registration-flags/${id}/clear`, {
    method: "POST",
  });

export const loginWithApple = (data: AppleAuthRequest): Promise<AuthResponse> =>
  apiRequest("/api/v1/account/authenticate/apple", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const linkAppleIdentity = (
  data: AppleLinkRequest,
): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/auth-identities/apple/link", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const refreshToken = (
  data: RefreshTokenRequest,
): Promise<AuthResponse> =>
  apiRequest("/api/v1/account/refresh-token", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const forgotPassword = (
  data: ForgotPasswordRequest,
): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resetPassword = (
  data: ResetPasswordRequest,
): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const changePassword = (
  data: ChangePasswordRequest,
): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const confirmEmail = (
  userId: string,
  code: string,
): Promise<{ message: string }> =>
  apiRequest(
    `/api/v1/account/confirm-email?user_id=${userId}&code=${encodeURIComponent(code)}`,
  );
