export interface AuditEventResponse {
  id: number;
  eventType: string;
  occurredAt: string | null;
  actorUserId: string | null;
  actorType: string;
  targetType: string | null;
  targetId: string | null;
  requestId: string | null;
  outcome: string;
  reasonCode: string | null;
  severity: string;
  retentionClass: string;
  metadataJson: Record<string, unknown> | null;
}

export interface ConsentUpdate {
  consentType: string;
  status: string;
  policyVersion?: string | null;
  derivedAgeStatus?: string | null;
  metadataJson?: Record<string, unknown> | null;
}

export interface ConsentRecordResponse {
  id: number;
  userId: string;
  consentType: string;
  status: string;
  actorUserId: string | null;
  actorType: string;
  policyVersion: string | null;
  derivedAgeStatus: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
  createdAt: string | null;
}
