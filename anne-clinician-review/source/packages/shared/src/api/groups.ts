import { apiRequest } from "./client";
import type {
  GroupCreate,
  GroupListPage,
  GroupMemberPage,
  GroupMeetingRequestCreate,
  GroupMeetingRequestResponse,
  GroupResponse,
  GroupSetupStatus,
  GroupUpdate,
  MentorCohortCreate,
  MentorCohortPage,
  MentorCohortResponse,
  MentorCohortUpdate,
} from "../types/group";
import type { UserListPage } from "../types/user";

interface PageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  groupType?: string;
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

export const getGroups = ({
  page = 1,
  pageSize = 50,
  search = "",
}: PageParams = {}): Promise<GroupListPage> =>
  apiRequest(
    `/api/v1/groups/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
  );

/** @deprecated use getGroups */
export const getAllGroups = getGroups;

export const getMyGroups = ({
  page = 1,
  pageSize = 50,
  search = "",
}: PageParams = {}): Promise<GroupListPage> =>
  apiRequest(
    `/api/v1/groups/my?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
  );

export const getMyGeneralGroup = (): Promise<GroupResponse> =>
  apiRequest("/api/v1/groups/my/general");

export const getLastActiveGroups = (): Promise<GroupResponse[]> =>
  apiRequest("/api/v1/groups/last-active");

export const getLastCreatedGroups = (): Promise<GroupResponse[]> =>
  apiRequest("/api/v1/groups/last-created");

export const getGroup = (id: number): Promise<GroupResponse> =>
  apiRequest(`/api/v1/groups/${id}`);

export const getGroupMembers = (
  id: number,
  { page = 1, pageSize = 20, search = "" }: PageParams = {},
): Promise<GroupMemberPage> =>
  apiRequest(
    `/api/v1/groups/${id}/members${query({ page, page_size: pageSize, search })}`,
  );

export const createGroup = (data: GroupCreate): Promise<GroupResponse> =>
  apiRequest("/api/v1/groups/", { method: "POST", body: JSON.stringify(data) });

export const updateGroup = (
  id: number,
  data: GroupUpdate,
): Promise<GroupResponse> =>
  apiRequest(`/api/v1/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteGroup = (id: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/groups/${id}`, { method: "DELETE" });

export const getGroupSetupStatus = (): Promise<GroupSetupStatus> =>
  apiRequest("/api/v1/groups/setup-status");

export const getMentorCohortsPage = ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
}: PageParams = {}): Promise<MentorCohortPage> =>
  apiRequest(
    `/api/v1/groups/admin/cohorts${query({ page, page_size: pageSize, search, status })}`,
  );

export const getAvailableCohortMentors = ({
  page = 1,
  pageSize = 10,
  search = "",
  timezone = "",
}: PageParams = {}): Promise<UserListPage> =>
  apiRequest(
    `/api/v1/groups/admin/cohorts/available-mentors${query({ page, page_size: pageSize, search, timezone })}`,
  );

export const getAdminCircles = ({
  page = 1,
  pageSize = 10,
  search = "",
  groupType = "",
  status = "active",
}: PageParams = {}): Promise<GroupListPage> =>
  apiRequest(
    `/api/v1/groups/admin/circles${query({ page, page_size: pageSize, search, group_type: groupType, status })}`,
  );

export const createMentorCohort = (
  data: MentorCohortCreate,
): Promise<MentorCohortResponse> =>
  apiRequest("/api/v1/groups/admin/cohorts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateMentorCohort = (
  id: number,
  data: MentorCohortUpdate,
): Promise<MentorCohortResponse> =>
  apiRequest(`/api/v1/groups/admin/cohorts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const addMentorToCohort = (
  cohortId: number,
  mentorUserId: string,
): Promise<MentorCohortResponse> =>
  apiRequest(
    `/api/v1/groups/admin/cohorts/${cohortId}/mentors/${mentorUserId}`,
    {
      method: "POST",
    },
  );

export const removeMentorFromCohort = (
  cohortId: number,
  mentorUserId: string,
): Promise<MentorCohortResponse> =>
  apiRequest(
    `/api/v1/groups/admin/cohorts/${cohortId}/mentors/${mentorUserId}`,
    {
      method: "DELETE",
    },
  );

export const getPendingMeetingRequestsPage = ({
  page = 1,
  pageSize = 10,
}: PageParams = {}): Promise<{
  items: GroupMeetingRequestResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}> =>
  apiRequest(
    `/api/v1/groups/admin/meeting-requests${query({ page, page_size: pageSize })}`,
  );

export const approveMeetingRequestAsAdmin = (
  id: number,
): Promise<GroupMeetingRequestResponse> =>
  apiRequest(`/api/v1/groups/admin/meeting-requests/${id}/approve`, {
    method: "POST",
  });

export const proposeGroupMeeting = (
  groupId: number,
  data: GroupMeetingRequestCreate,
): Promise<GroupMeetingRequestResponse> =>
  apiRequest(`/api/v1/groups/${groupId}/meeting-requests`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const approveMeetingRequestAsMentor = (
  id: number,
): Promise<GroupMeetingRequestResponse> =>
  apiRequest(`/api/v1/groups/meeting-requests/${id}/mentor-approve`, {
    method: "POST",
  });

export const denyMeetingRequestAsMentor = (
  id: number,
): Promise<GroupMeetingRequestResponse> =>
  apiRequest(`/api/v1/groups/meeting-requests/${id}/mentor-deny`, {
    method: "POST",
  });
