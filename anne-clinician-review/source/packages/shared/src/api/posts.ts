import { apiRequest } from "./client";
import type { LikeResponse, PostCreate, PostListPage, PostResponse, ReplyCreate, ReplyResponse } from "../types/post";

interface PageParams {
  page?: number;
  pageSize?: number;
}

export const getFeed = ({ page = 1, pageSize = 20 }: PageParams = {}): Promise<PostListPage> =>
  apiRequest(`/api/v1/posts/?page=${page}&page_size=${pageSize}`);

export const getMyFeed = ({ page = 1, pageSize = 20 }: PageParams = {}): Promise<PostListPage> =>
  apiRequest(`/api/v1/posts/my?page=${page}&page_size=${pageSize}`);

export const getPost = (id: number): Promise<PostResponse> =>
  apiRequest(`/api/v1/posts/${id}`);

export const createPost = (data: PostCreate): Promise<PostResponse> =>
  apiRequest("/api/v1/posts/", { method: "POST", body: JSON.stringify(data) });

export const deletePost = (id: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/posts/${id}`, { method: "DELETE" });

export const likePost = (id: number): Promise<LikeResponse> =>
  apiRequest(`/api/v1/posts/${id}/like`, { method: "POST" });

export const unlikePost = (id: number): Promise<LikeResponse> =>
  apiRequest(`/api/v1/posts/${id}/like`, { method: "DELETE" });

export const createReply = (postId: number, data: ReplyCreate): Promise<ReplyResponse> =>
  apiRequest(`/api/v1/posts/${postId}/reply`, { method: "POST", body: JSON.stringify(data) });

export const deleteReply = (replyId: number): Promise<{ message: string }> =>
  apiRequest(`/api/v1/posts/reply/${replyId}`, { method: "DELETE" });

export const likeReply = (replyId: number): Promise<LikeResponse> =>
  apiRequest(`/api/v1/posts/reply/${replyId}/like`, { method: "POST" });

export const unlikeReply = (replyId: number): Promise<LikeResponse> =>
  apiRequest(`/api/v1/posts/reply/${replyId}/like`, { method: "DELETE" });

export const getGroupPosts = (groupId: number, { page = 1, pageSize = 20 }: PageParams = {}): Promise<PostListPage> =>
  apiRequest(`/api/v1/groups/${groupId}/posts?page=${page}&page_size=${pageSize}`);
