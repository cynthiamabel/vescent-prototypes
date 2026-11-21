import { apiRequest } from "./client";
import type {
  EvidenceAccess,
  TranscriptSegment,
  VideoJoinToken,
  VideoRoom,
  VideoRoomCreate,
  VideoSafetyCase,
  VideoSafetySignal,
} from "../types/video";

export const createVideoRoom = (data: VideoRoomCreate): Promise<VideoRoom> =>
  apiRequest("/api/v1/video/rooms", { method: "POST", body: JSON.stringify(data) });

export const createGroupVideoRoom = (groupId: number): Promise<VideoRoom> =>
  createVideoRoom({ groupId, roomType: "group" });

export const createConversationVideoRoom = (conversationSid: string): Promise<VideoRoom> =>
  createVideoRoom({ conversationSid, roomType: "conversation" });

export const getVideoJoinToken = (roomId: number): Promise<VideoJoinToken> =>
  apiRequest(`/api/v1/video/rooms/${roomId}/join-token`, { method: "POST" });

export const getActiveVideoRooms = (): Promise<VideoRoom[]> =>
  apiRequest("/api/v1/video/rooms/active");

export const leaveVideoRoom = (roomId: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/video/rooms/${roomId}/leave`, { method: "POST" });

export const heartbeatVideoRoom = (roomId: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/video/rooms/${roomId}/heartbeat`, { method: "POST" });

export const ingestVideoTranscript = (
  roomId: number,
  segments: TranscriptSegment[],
  ingestSecret?: string
): Promise<VideoSafetySignal> => {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify({ roomId, segments }),
  };
  if (ingestSecret) {
    options.headers = { "X-Video-Transcript-Secret": ingestSecret };
  }
  return apiRequest("/api/v1/video/transcripts/ingest", options);
};

export const getVideoSafetyCases = (status = "open"): Promise<VideoSafetyCase[]> =>
  apiRequest(`/api/v1/video/admin/safety-cases?status=${encodeURIComponent(status)}`);

export const createEvidenceAccessUrl = (
  caseId: number,
  reasonCode: string
): Promise<EvidenceAccess> =>
  apiRequest(`/api/v1/video/admin/safety-cases/${caseId}/evidence-url`, {
    method: "POST",
    body: JSON.stringify({ reasonCode }),
  });
