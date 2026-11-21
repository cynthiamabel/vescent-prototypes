export interface TwilioTokenResponse {
  token: string;
}

export interface ConversationParticipant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface TwilioConversation {
  conversationSid: string;
  friendlyName: string | null;
  lastMessageBody: string | null;
  lastMessageDate: string | null;
  unreadCount: number;
  created: boolean;
  participants: ConversationParticipant[];
  blocked: boolean;
}

export interface TwilioConversationPage {
  items: TwilioConversation[];
  page: number;
  pageSize: number;
  total: number | null;
  hasNextPage: boolean;
  nextPageToken: string | null;
}

export type TwilioConversationCreated = TwilioConversation & { created: true };

export interface ConversationCreateRequest {
  otherUserIds: string[];
}

export interface TwilioMessage {
  sid: string;
  author: string | null;
  body: string | null;
  dateCreated: string | null;
  moderationStatus: string;
  moderationReason: string | null;
  safetyIntervention?: Record<string, unknown> | null;
}

export interface TwilioMessagePage {
  items: TwilioMessage[];
  page: number;
  pageSize: number;
  total: number | null;
  hasNextPage: boolean;
  nextPageToken: string | null;
}

export interface ConversationMessageCreateRequest {
  body: string;
}
