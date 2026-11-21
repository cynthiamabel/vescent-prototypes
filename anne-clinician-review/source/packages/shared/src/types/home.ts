import type { CardAction } from "./card";

export interface HomeContent {
  id: number;
  contentType: "gratitude" | "quick_read" | string;
  label: string | null;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaAction: CardAction | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface HomeContentCreate {
  contentType: "gratitude" | "quick_read" | string;
  label?: string | null;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaAction?: CardAction | null;
  priority?: number;
  isActive?: boolean;
}

export type HomeContentUpdate = Partial<HomeContentCreate>;

export interface HomeActivityItem {
  id: string;
  kind: "post" | "reply" | "like" | "message" | string;
  title: string;
  summary: string;
  meta: string | null;
  groupId: number;
  groupName: string;
  postId: number;
  targetType: string | null;
  targetId: string | null;
  conversationSid: string | null;
  imageUrl: string | null;
  createdAt: string | null;
}

export interface HomeResponse {
  newForYou: HomeActivityItem[];
  gratitude: HomeContent | null;
  quickRead: HomeContent | null;
}
