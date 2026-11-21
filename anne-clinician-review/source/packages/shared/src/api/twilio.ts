import { apiRequest } from "./client";
import type {
  ConversationCreateRequest,
  ConversationMessageCreateRequest,
  TwilioConversation,
  TwilioConversationPage,
  TwilioMessage,
  TwilioMessagePage,
  TwilioTokenResponse,
} from "../types/twilio";

export const getTwilioToken = (): Promise<TwilioTokenResponse> =>
  apiRequest("/api/v1/twilio/token", { method: "POST" });

export const createConversation = (body: ConversationCreateRequest): Promise<TwilioConversation> =>
  apiRequest("/api/v1/twilio/conversations", {
    method: "POST",
    body: JSON.stringify(body),
  });

interface PageParams {
  page?: number;
  pageSize?: number;
  pageToken?: string | null;
}

export const listConversations = ({
  page = 1,
  pageSize = 20,
  pageToken,
}: PageParams = {}): Promise<TwilioConversationPage> =>
  apiRequest(
    `/api/v1/twilio/conversations?${new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(pageToken ? { page_token: pageToken } : {}),
    }).toString()}`,
  );

export const listConversationMessages = (
  conversationSid: string,
  { page = 1, pageSize = 30, pageToken }: PageParams = {},
): Promise<TwilioMessagePage> =>
  apiRequest(
    `/api/v1/twilio/conversations/${conversationSid}/messages?${new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(pageToken ? { page_token: pageToken } : {}),
    }).toString()}`,
  );

export const sendConversationMessage = (
  conversationSid: string,
  body: ConversationMessageCreateRequest
): Promise<TwilioMessage> =>
  apiRequest(`/api/v1/twilio/conversations/${conversationSid}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
  });
