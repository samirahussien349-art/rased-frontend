export type AllowedContentType =
  | "video/mp4"
  | "video/quicktime"
  | "video/webm"
  | "video/x-matroska";

export type AnalysisStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface VideoFile {
  file: File;
  filename: string;
  contentType: AllowedContentType;
  size: number;
}

export interface AnalysisResult {
  analysisId: string;
  videoId: string;
  status: AnalysisStatus;
  result: unknown | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}