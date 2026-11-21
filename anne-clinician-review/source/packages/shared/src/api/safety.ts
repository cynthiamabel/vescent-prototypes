import { apiRequest } from "./client";
import type {
  AccountStatusResponse,
  AccountSuspendRequest,
  AccountUnsuspendRequest,
  SafetyCaseResponse,
  SafetyReportCreate,
  SafetyReportResponse,
  SafetyRiskRollupResponse,
  SafetyReviewDetail,
  SafetyReviewPage,
  SafetyEvidenceAccessResponse,
  SafetyHighRiskUsersPage,
  UserBlockCreate,
  UserBlockResponse,
  BlockedUserAnalyticsResponse,
} from "../types/safety";

interface AdminSafetyPageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  surface?: string;
  status?: string;
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export const getAccountStatus = (): Promise<AccountStatusResponse> =>
  apiRequest("/api/v1/safety/account-status");

export const getSafetyReportReasons = (): Promise<
  Array<{ code: string; label: string }>
> => apiRequest("/api/v1/safety/report-reasons");

export const createSafetyReport = (
  data: SafetyReportCreate,
): Promise<SafetyReportResponse> =>
  apiRequest("/api/v1/safety/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listSafetyCases = (
  status = "open",
): Promise<SafetyCaseResponse[]> =>
  apiRequest(`/api/v1/safety/admin/cases?status=${encodeURIComponent(status)}`);

export const listAdminSafetyReports = ({
  page = 1,
  pageSize = 10,
  search = "",
  category = "",
  surface = "",
  status = "",
}: AdminSafetyPageParams = {}): Promise<SafetyReviewPage> =>
  apiRequest(
    `/api/v1/safety/admin/reports${query({ page, page_size: pageSize, search, category, surface, status })}`,
  );

export const listAdminAutomatedTakedowns = ({
  page = 1,
  pageSize = 10,
  search = "",
  category = "",
  surface = "",
  status = "",
}: AdminSafetyPageParams = {}): Promise<SafetyReviewPage> =>
  apiRequest(
    `/api/v1/safety/admin/automated-takedowns${query({ page, page_size: pageSize, search, category, surface, status })}`,
  );

export const listAdminRegistrationSafety = ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "active",
}: AdminSafetyPageParams = {}): Promise<SafetyReviewPage> =>
  apiRequest(
    `/api/v1/safety/admin/registration${query({ page, page_size: pageSize, search, status })}`,
  );

export const listAdminHighRiskUsers = ({
  page = 1,
  pageSize = 10,
  search = "",
}: AdminSafetyPageParams = {}): Promise<SafetyHighRiskUsersPage> =>
  apiRequest(
    `/api/v1/safety/admin/high-risk-users${query({ page, page_size: pageSize, search })}`,
  );

export const getAdminSafetyCaseDetail = (
  sourceSystem: string,
  sourceType: string,
  sourceId: string,
): Promise<SafetyReviewDetail> =>
  apiRequest(
    `/api/v1/safety/admin/cases/${encodeURIComponent(sourceSystem)}/${encodeURIComponent(sourceType)}/${encodeURIComponent(sourceId)}`,
  );

export const getSafetyEvidenceUrl = (data: {
  sourceSystem: string;
  sourceType: string;
  sourceId: string;
  caseId?: number | null;
  reasonCode?: string | null;
}): Promise<SafetyEvidenceAccessResponse> =>
  apiRequest("/api/v1/safety/admin/evidence-url", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const addSafetyCaseAction = (
  caseId: number,
  data: {
    action: string;
    reasonCode?: string | null;
    note?: string | null;
    targetUserId?: string | null;
  },
): Promise<{ id: number; message: string }> =>
  apiRequest(`/api/v1/safety/admin/cases/${caseId}/actions`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const suspendAccount = (
  data: AccountSuspendRequest,
): Promise<{ message: string; userId: string }> =>
  apiRequest("/api/v1/safety/admin/accounts/suspend", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const unsuspendAccount = (
  data: AccountUnsuspendRequest,
): Promise<{ message: string; userId: string }> =>
  apiRequest("/api/v1/safety/admin/accounts/unsuspend", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const listSafetyRiskRollups = (
  limit = 100,
): Promise<SafetyRiskRollupResponse[]> =>
  apiRequest(`/api/v1/safety/admin/rollups?limit=${limit}`);

export const blockUser = (
  data: UserBlockCreate,
): Promise<{ message: string; userId: string }> =>
  apiRequest("/api/v1/safety/blocks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const unblockUser = (
  blockedUserId: string,
): Promise<{ message: string; userId: string }> =>
  apiRequest(`/api/v1/safety/blocks/${encodeURIComponent(blockedUserId)}`, {
    method: "DELETE",
  });

export const listBlockedUsers = (): Promise<UserBlockResponse[]> =>
  apiRequest("/api/v1/safety/blocks");

export const listTopBlockedUsers = (
  limit = 20,
): Promise<BlockedUserAnalyticsResponse[]> =>
  apiRequest(`/api/v1/safety/admin/blocked-users?limit=${limit}`);
