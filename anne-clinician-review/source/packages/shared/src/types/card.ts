export interface MessageAction {
  type: "message";
  userId: string;
}

export interface MessageMentorAction {
  type: "message_mentor";
}

export interface GoToCohortAction {
  type: "go_to_cohort";
}

export interface GoToGeneralAction {
  type: "go_to_general";
}

export interface UrlAction {
  type: "url";
  url: string;
}

export interface RouteAction {
  type: "route";
  route: string;
}

export interface FeedPostAction {
  type: "new_feed_post";
}

export interface EditProfileAction {
  type: "edit_profile";
}

export type CardAction =
  | MessageAction
  | MessageMentorAction
  | GoToCohortAction
  | GoToGeneralAction
  | UrlAction
  | RouteAction
  | FeedPostAction
  | EditProfileAction;

export interface Card {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaAction: CardAction | null;
  priority: number;
  isActive: boolean;
  isRecurring: boolean;
}

export interface UpNextResponse {
  card: Card | null;
}

export interface CardCreate {
  title: string;
  body: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaAction?: CardAction | null;
  priority?: number;
  isActive?: boolean;
  isRecurring?: boolean;
}

export type CardUpdate = Partial<CardCreate>;
