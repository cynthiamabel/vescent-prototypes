import { apiRequest } from "./client";

export interface PresignedUrlResponse {
  uploadUrl: string;
  finalUrl: string;
}

export const getPresignedUrl = (
  filename: string,
  contentType: string,
  uploadType: "avatar" | "post" | "group" | "content" = "post",
): Promise<PresignedUrlResponse> =>
  apiRequest("/api/v1/upload/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      filename,
      content_type: contentType,
      upload_type: uploadType,
    }),
  });

export const uploadToS3 = async (
  file: File | Blob,
  uploadUrl: string,
): Promise<void> => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type":
        file instanceof File ? file.type : "application/octet-stream",
    },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.statusText}`);
  }
};
