import { apiRequest } from "./client";
import type { HomeContent, HomeContentCreate, HomeContentUpdate, HomeResponse } from "../types/home";

export const getHome = (): Promise<HomeResponse> =>
  apiRequest<HomeResponse>("/api/v1/home");

export const listHomeContent = (): Promise<HomeContent[]> =>
  apiRequest<HomeContent[]>("/api/v1/home/admin/content");

export const createHomeContent = (data: HomeContentCreate): Promise<HomeContent> =>
  apiRequest<HomeContent>("/api/v1/home/admin/content", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateHomeContent = (
  id: number,
  data: HomeContentUpdate
): Promise<HomeContent> =>
  apiRequest<HomeContent>(`/api/v1/home/admin/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteHomeContent = (id: number): Promise<{ message: string }> =>
  apiRequest<{ message: string }>(`/api/v1/home/admin/content/${id}`, {
    method: "DELETE",
  });
