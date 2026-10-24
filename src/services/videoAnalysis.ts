import { apiRequest } from "./api";

export interface VideoUploadRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface VideoUploadResponse {
  videoId: string;
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface VideoConfirmResponse {
  videoId: string;
  storageKey: string;
  size: number;
  contentType: string;
  status: "UPLOADED";
}

export interface AnalysisRequest {
  videoId: string;
}

export interface AnalysisResponse {
  analysisId: string;
  status: "PENDING";
}

export interface AnalysisStatusResponse {
  analysisId: string;
  videoId: string;
  storageKey: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  result: unknown | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export function requestVideoUpload(data: VideoUploadRequest) {
  return apiRequest<VideoUploadResponse>("/videos/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function confirmVideoUpload(videoId: string) {
  return apiRequest<VideoConfirmResponse>(
    `/videos/${encodeURIComponent(videoId)}/confirm`,
    {
      method: "POST",
    },
  );
}

export function startVideoAnalysis(videoId: string) {
  return apiRequest<AnalysisResponse>("/analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videoId }),
  });
}

export function getAnalysisStatus(analysisId: string) {
  return apiRequest<AnalysisStatusResponse>(
    `/analyses/${encodeURIComponent(analysisId)}`,
  );
}