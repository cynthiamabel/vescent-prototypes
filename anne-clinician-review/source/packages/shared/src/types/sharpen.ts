export interface SharpenTrack {
  id: number;
  title: string;
  description: string | null;
  modules: number[];
}

export interface SharpenVideo {
  id: number;
  title: string | null;
  description: string | null;
  transcript: string | null;
  file: string | null;
  thumbnail: string | null;
  duration: string | null;
}

export interface SharpenContentNode {
  id: string | number | null;
  type: "section_heading" | "paragraph" | "quotation" | "image" | "video_with_description" | string;
  value: unknown;
}

export interface SharpenModuleBody {
  id: number | null;
  body: SharpenContentNode[];
  mindSharpenerImage1: string | null;
  mindSharpenerImage2: string | null;
}

export interface SharpenModule {
  id: number;
  title: string;
  description: string | null;
  intro: SharpenContentNode[];
  body: SharpenModuleBody | null;
  outro: SharpenContentNode[];
  bannerImage: string | null;
  videos: SharpenVideo[];
}

export interface SharpenCatalogItem {
  moduleId: number;
  trackId: number | null;
  trackTitle: string | null;
  title: string;
  description: string | null;
  bannerImage: string | null;
  videoId: number | null;
  videoTitle: string | null;
  videoThumbnail: string | null;
  videoDuration: string | null;
}

export interface SharpenCatalogResponse {
  items: SharpenCatalogItem[];
}
