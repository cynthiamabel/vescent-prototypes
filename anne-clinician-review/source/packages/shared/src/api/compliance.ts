import { apiRequest } from "./client";
import type {
  AuditEventResponse,
  ConsentRecordResponse,
  ConsentUpdate,
} from "../types/compliance";

const query = (params: Record<string, string | number | null | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const rendered = search.toString();
  return rendered ? `?${rendered}` : "";
};

export const listAuditEvents = (
  params: {
    userId?: string;
    eventType?: string;
    outcome?: string;
    requestId?: string;
    targetType?: string;
    targetId?: string;
    limit?: number;
  } = {},
): Promise<AuditEventResponse[]> =>
  apiRequest(
    `/api/v1/compliance/admin/audit-events${query({
      user_id: params.userId,
      event_type: params.eventType,
      outcome: params.outcome,
      request_id: params.requestId,
      target_type: params.targetType,
      target_id: params.targetId,
      limit: params.limit ?? 100,
    })}`,
  );

export const listUserAuditTimeline = (
  userId: string,
  limit = 100,
): Promise<AuditEventResponse[]> =>
  apiRequest(
    `/api/v1/compliance/admin/users/${encodeURIComponent(userId)}/audit-timeline?limit=${limit}`,
  );

export const listSafetyCaseAuditTimeline = (
  caseId: number,
  limit = 100,
): Promise<AuditEventResponse[]> =>
  apiRequest(
    `/api/v1/compliance/admin/safety-cases/${caseId}/audit-timeline?limit=${limit}`,
  );

export const listMyConsents = (): Promise<ConsentRecordResponse[]> =>
  apiRequest("/api/v1/compliance/consents");

export const updateMyConsent = (
  data: ConsentUpdate,
): Promise<ConsentRecordResponse> =>
  apiRequest("/api/v1/compliance/consents", {
    method: "POST",
    body: JSON.stringify(data),
  });
