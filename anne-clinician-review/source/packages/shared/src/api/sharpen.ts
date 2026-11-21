import { apiRequest } from "./client";
import type { SharpenCatalogResponse, SharpenModule, SharpenVideo } from "../types/sharpen";

export const searchSharpenCatalog = (
  query = "",
  page = 1,
): Promise<SharpenCatalogResponse> =>
  apiRequest(`/api/v1/sharpen/catalog?q=${encodeURIComponent(query)}&page=${page}`);

export const getSharpenModule = (moduleId: string | number): Promise<SharpenModule> =>
  apiRequest(`/api/v1/sharpen/modules/${moduleId}`);

export const getSharpenVideo = (videoId: string | number): Promise<SharpenVideo> =>
  apiRequest(`/api/v1/sharpen/videos/${videoId}`);

export const trackSharpenModuleView = (
  moduleId: string | number,
  moduleTitle?: string,
): Promise<{ tracked: boolean }> =>
  apiRequest(`/api/v1/sharpen/modules/${moduleId}/view`, {
    method: "POST",
    body: JSON.stringify({ moduleTitle }),
  });
