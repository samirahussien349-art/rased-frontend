import { apiRequest, makeApiError } from "./api";
import type { AllowedContentType, AnalysisStatus } from "../types/analysis";

export interface VideoUploadRequest {
  filename: string;
  contentType: AllowedContentType;
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
  contentType: AllowedContentType;
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
  status: AnalysisStatus;
  result: unknown | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

const VALID_STATUSES: readonly string[] = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export async function requestVideoUpload(data: VideoUploadRequest, signal?: AbortSignal) {
  const res = await apiRequest<VideoUploadResponse>("/videos/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });
  if (!isNonEmptyString(res.videoId) || !isNonEmptyString(res.uploadUrl)) {
    throw makeApiError(200, "INVALID_RESPONSE");
  }
  return res;
}

// PUT the raw file to the presigned URL with real progress. The Content-Type must be
// the same value that was sent to /upload-url (it is part of the presigned signature).
export function uploadVideoToStorage(
  uploadUrl: string,
  file: File,
  contentType: AllowedContentType,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(file.size, file.size);
        resolve();
      } else {
        reject(makeApiError(xhr.status, "UPLOAD_FAILED"));
      }
    };
    xhr.onerror = () => reject(makeApiError(0, "NETWORK_ERROR"));
    xhr.ontimeout = () => reject(makeApiError(0, "NETWORK_ERROR"));
    xhr.onabort = () => reject(makeApiError(0, "ABORTED"));

    if (signal) {
      if (signal.aborted) {
        reject(makeApiError(0, "ABORTED"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(file);
  });
}

export function confirmVideoUpload(videoId: string, signal?: AbortSignal) {
  return apiRequest<VideoConfirmResponse>(
    `/videos/${encodeURIComponent(videoId)}/confirm`,
    { method: "POST", signal },
  );
}

export async function startVideoAnalysis(videoId: string, signal?: AbortSignal) {
  const res = await apiRequest<AnalysisResponse>("/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoId }),
    signal,
  });
  if (!isNonEmptyString(res.analysisId)) {
    throw makeApiError(200, "INVALID_RESPONSE");
  }
  return res;
}

export async function getAnalysisStatus(analysisId: string, signal?: AbortSignal) {
  const res = await apiRequest<AnalysisStatusResponse>(
    `/analyses/${encodeURIComponent(analysisId)}`,
    { signal },
  );
  if (!VALID_STATUSES.includes(res.status)) {
    throw makeApiError(200, "INVALID_RESPONSE");
  }
  return res;
}
