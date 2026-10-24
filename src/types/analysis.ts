export type AnalysisStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface VideoFile {
  file: File;
  filename: string;
  contentType: string;
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