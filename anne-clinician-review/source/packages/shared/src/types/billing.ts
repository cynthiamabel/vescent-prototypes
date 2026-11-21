import type { UserTier } from "./enums";
import type { OnboardingProfileRegisterRequest } from "./auth";

export type BillingStatus =
  | "free"
  | "pending"
  | "active"
  | "trialing"
  | "past_due"
  | "incomplete"
  | "canceled"
  | "unpaid"
  | "unknown"
  | string;

export interface RegistrationCheckoutRequest {
  profile: OnboardingProfileRegisterRequest;
  returnContext: "web" | "mobile";
}

export interface RegistrationCheckoutResponse {
  userId: string;
  status: BillingStatus;
  userTier: UserTier;
  checkoutUrl: string | null;
  checkoutSessionId: string | null;
  message: string;
}

export interface RegistrationStatusResponse {
  userId: string | null;
  status: BillingStatus;
  userTier: UserTier | null;
  emailSent: boolean;
  message: string;
}

export interface SubscriptionResponse {
  userTier: UserTier | null;
  billingStatus: BillingStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  pendingSelectedTier: UserTier | null;
  pendingChangeAt: string | null;
  portalAvailable: boolean;
}

export interface SubscriptionCheckoutRequest {
  userTier: UserTier;
  returnContext: "web" | "mobile";
}

export interface SubscriptionCheckoutResponse {
  status: BillingStatus;
  userTier: UserTier;
  checkoutUrl: string | null;
  checkoutSessionId: string | null;
  message: string;
}

export interface PortalSessionRequest {
  returnContext: "web" | "mobile";
}

export interface PortalSessionResponse {
  url: string;
}
