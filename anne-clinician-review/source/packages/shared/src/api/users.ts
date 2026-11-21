import { apiRequest, apiRequestBlob } from "./client";
import type {
  UserListItem,
  UserListPage,
  UserProfile,
  UserProfileUpdate,
} from "../types/user";

export const getUserProfile = (id: string): Promise<UserProfile> =>
  apiRequest(`/api/v1/user-profiles/${id}`);

export const updateUserProfile = (
  data: UserProfileUpdate,
): Promise<UserProfile> =>
  apiRequest("/api/v1/user-profiles/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteMyAccount = (): Promise<{ message: string }> =>
  apiRequest("/api/v1/account/me", { method: "DELETE" });

interface AdminUserPageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tier?: string;
  timezone?: string;
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export const listAdminUsers = ({
  page = 1,
  pageSize = 25,
  search = "",
}: AdminUserPageParams = {}): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/account/users${query({ page, page_size: pageSize, search })}`,
  );

export const searchUsers = ({
  search = "",
  page = 1,
  pageSize = 20,
}: AdminUserPageParams = {}): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/account/users/search${query({ q: search, page, page_size: pageSize })}`,
  );

export const listAdminMentors = ({
  page = 1,
  pageSize = 10,
  search = "",
  timezone = "",
}: AdminUserPageParams = {}): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/account/admin/mentors${query({ page, page_size: pageSize, search, timezone })}`,
  );

export const listAdminMentorMentees = (
  mentorUserId: string,
  {
    page = 1,
    pageSize = 10,
    search = "",
    tier = "",
    timezone = "",
  }: AdminUserPageParams = {},
): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/account/admin/mentors/${mentorUserId}/mentees${query({ page, page_size: pageSize, search, tier, timezone })}`,
  );

export const listAdminUnassignedMentees = ({
  page = 1,
  pageSize = 10,
  search = "",
  tier = "",
  timezone = "",
}: AdminUserPageParams = {}): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/account/admin/mentees/unassigned${query({ page, page_size: pageSize, search, tier, timezone })}`,
  );

export const exportAdminUnassignedMenteeAnswers = ({
  search = "",
  tier = "",
  timezone = "",
}: AdminUserPageParams = {}): Promise<Blob> =>
  apiRequestBlob(
    `/api/v1/account/admin/mentees/unassigned/answers/export${query({ search, tier, timezone })}`,
  );

export const exportAdminUserAnswers = (userId: string): Promise<Blob> =>
  apiRequestBlob(
    `/api/v1/account/admin/users/${encodeURIComponent(userId)}/answers/export`,
  );

export const assignUserMentor = (
  userId: string,
  mentorUserId: string | null,
): Promise<UserListItem> =>
  apiRequest(`/api/v1/account/users/${userId}/mentor`, {
    method: "PATCH",
    body: JSON.stringify({ mentorUserId }),
  });

export const unassignUserMentor = (userId: string): Promise<UserListItem> =>
  apiRequest(`/api/v1/account/admin/users/${userId}/mentor`, {
    method: "DELETE",
  });
