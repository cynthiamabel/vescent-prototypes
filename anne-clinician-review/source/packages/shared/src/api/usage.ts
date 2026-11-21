import { apiRequest } from "./client";
import type {
  UsageDailyStats,
  UsageEventCreate,
  UsageEventResponse,
  UsageInvestorStats,
  UsageSummary,
} from "../types/usage";

export const recordUsageEvent = (
  body: UsageEventCreate,
): Promise<UsageEventResponse> =>
  apiRequest("/api/v1/usage/events", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getUsageSummary = (days = 30): Promise<UsageSummary> =>
  apiRequest(`/api/v1/usage/admin/summary?days=${days}`);

export const getUsageInvestorStats = (): Promise<UsageInvestorStats> =>
  apiRequest("/api/v1/usage/admin/investor-stats");

export const getUserUsageDailyStats = (
  userId: string,
  days = 30,
): Promise<UsageDailyStats[]> =>
  apiRequest(
    `/api/v1/usage/admin/users/${encodeURIComponent(userId)}/daily?days=${days}`,
  );
