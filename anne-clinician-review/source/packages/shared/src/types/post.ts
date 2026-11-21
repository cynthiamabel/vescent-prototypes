export interface ReplyResponse {
  id: number;
  content: string;
  postId: number;
  createdBy: string;  // User UUID
  authorUsername: string;
  authorFirstName: string;
  authorLastName: string;
  authorProfilePictureUrl: string | null;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  moderationStatus: string;
  moderationReason: string | null;
  safetyIntervention?: Record<string, unknown> | null;
}

export interface PostResponse {
  id: number;
  content: string | null;
  mediaUrl: string | null;
  sharpenReference: string | null;
  groupId: number | null;
  groupName: string | null;
  createdBy: string;  // User UUID
  authorUsername: string;
  authorFirstName: string;
  authorLastName: string;
  authorProfilePictureUrl: string | null;
  replies: ReplyResponse[];
  likesCount: number;
  lastLikeUsername: string | null;
  isLiked: boolean;
  createdAt: string;
  moderationStatus: string;
  moderationReason: string | null;
  safetyIntervention?: Record<string, unknown> | null;
}

export interface PostListPage {
  items: PostResponse[];
  page: number;
  pageSize: number;
  total: number | null;
  hasNextPage: boolean;
}

export interface PostCreate {
  content?: string;
  mediaUrl?: string;
  sharpenReference?: string;
  groupId?: number;
}

export interface ReplyCreate {
  content: string;
}

export interface LikeResponse {
  likesCount: number;
  isLiked: boolean;
}
