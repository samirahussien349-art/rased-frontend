import type { AllowedContentType } from "../types/analysis";

// Must match the backend contract (POST /api/v1/videos/upload-url).
export const MAX_VIDEO_SIZE_BYTES = 524_288_000; // 500 MB
export const MAX_VIDEO_SIZE_LABEL = "500 ميجابايت";

export const ALLOWED_CONTENT_TYPES: readonly AllowedContentType[] = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
];

export const EXTENSION_TO_CONTENT_TYPE: Record<string, AllowedContentType> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

export const ACCEPT_ATTRIBUTE =
  "video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv";

export const SUPPORTED_FORMATS_LABEL = "MP4, MOV, WebM, MKV";

// Analysis polling
export const POLL_INTERVAL_MS = 3_000;
export const POLL_TIMEOUT_MS = 30 * 60 * 1_000; // 30 minutes
export const POLL_MAX_CONSECUTIVE_FAILURES = 5;

export const ANALYSIS_QUERY_PARAM = "analysisId";
