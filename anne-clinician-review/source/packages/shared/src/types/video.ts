export interface VideoRoom {
  id: number;
  roomType: string;
  provider: string;
  providerChannelName: string;
  groupId: number | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface VideoRoomCreate {
  groupId?: number | null;
  conversationSid?: string | null;
  roomType?: string;
}

export interface VideoJoinToken {
  room: VideoRoom;
  appId: string;
  channelName: string;
  displayName: string;
  token: string;
  uid: number;
  expiresInSeconds: number;
}

export interface TranscriptSegment {
  speakerUserId?: string | null;
  speakerLabel?: string | null;
  text: string;
  startedAtMs?: number | null;
  endedAtMs?: number | null;
}

export interface VideoSafetySignal {
  riskLevel: string;
  categories: string[];
  confidence: number;
  recommendedAction: string;
  safetyCaseId: number | null;
}

export interface VideoSafetyCase {
  id: number;
  roomId: number;
  status: string;
  riskLevel: string;
  categories: string[];
  confidence: number;
  recommendedAction: string;
  reason: string | null;
  retentionExpiresAt: string;
}

export interface EvidenceAccess {
  url: string;
  expiresInSeconds: number;
}
