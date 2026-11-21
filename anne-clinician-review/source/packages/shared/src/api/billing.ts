import { apiRequest } from "./client";
import type {
  PortalSessionRequest,
  PortalSessionResponse,
  RegistrationCheckoutRequest,
  RegistrationCheckoutResponse,
  RegistrationStatusResponse,
  SubscriptionCheckoutRequest,
  SubscriptionCheckoutResponse,
  SubscriptionResponse,
} from "../types/billing";

export const createRegistrationCheckout = (
  data: RegistrationCheckoutRequest
): Promise<RegistrationCheckoutResponse> =>
  apiRequest("/api/v1/billing/registration-checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getRegistrationStatus = (
  sessionId: string
): Promise<RegistrationStatusResponse> =>
  apiRequest(`/api/v1/billing/registration-status?session_id=${encodeURIComponent(sessionId)}`);

export const getSubscription = (): Promise<SubscriptionResponse> =>
  apiRequest("/api/v1/billing/subscription");

export const createSubscriptionCheckout = (
  data: SubscriptionCheckoutRequest
): Promise<SubscriptionCheckoutResponse> =>
  apiRequest("/api/v1/billing/subscription-checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createCustomerPortalSession = (
  data: PortalSessionRequest
): Promise<PortalSessionResponse> =>
  apiRequest("/api/v1/billing/customer-portal", {
    method: "POST",
    body: JSON.stringify(data),
  });
