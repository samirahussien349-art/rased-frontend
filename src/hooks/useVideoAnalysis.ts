import { useCallback, useEffect, useRef, useState } from "react";
import {
  confirmVideoUpload,
  getAnalysisStatus,
  requestVideoUpload,
  startVideoAnalysis,
  uploadVideoToStorage,
} from "../services/videoAnalysis";
import type { AnalysisStatusResponse } from "../services/videoAnalysis";
import { ApiError, getErrorMessage } from "../services/api";
import type { AllowedContentType } from "../types/analysis";
import {
  ALLOWED_CONTENT_TYPES,
  EXTENSION_TO_CONTENT_TYPE,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_LABEL,
  POLL_INTERVAL_MS,
  POLL_MAX_CONSECUTIVE_FAILURES,
  POLL_TIMEOUT_MS,
  SUPPORTED_FORMATS_LABEL,
} from "../utils/constants";

// ---------- Validation (kept in sync with the backend contract) ----------

export type FileValidation =
  | { ok: true; contentType: AllowedContentType }
  | { ok: false; message: string };

export function validateVideoFile(file: File): FileValidation {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byType = ALLOWED_CONTENT_TYPES.find((type) => type === file.type);
  // Browsers often report an empty/unknown type for .mkv, so fall back to the extension.
  const contentType = byType ?? EXTENSION_TO_CONTENT_TYPE[ext];
  if (!contentType) {
    return { ok: false, message: `الصيغ المدعومة هي ${SUPPORTED_FORMATS_LABEL}.` };
  }
  if (file.size <= 0) {
    return { ok: false, message: "الملف فارغ." };
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { ok: false, message: `الحد الأقصى لحجم الفيديو هو ${MAX_VIDEO_SIZE_LABEL}.` };
  }
  return { ok: true, contentType };
}

// ---------- Upload + start analysis ----------

export type UploadPhase =
  | "idle"
  | "requesting"
  | "uploading"
  | "confirming"
  | "starting"
  | "done"
  | "error";

export interface UploadState {
  phase: UploadPhase;
  loaded: number;
  total: number;
  progress: number; // 0..100, real bytes sent
  error: string;
  analysisId: string | null;
}

const INITIAL_UPLOAD_STATE: UploadState = {
  phase: "idle",
  loaded: 0,
  total: 0,
  progress: 0,
  error: "",
  analysisId: null,
};

type Resume = { file: File; videoId: string; step: "uploaded" | "confirmed" } | null;

export function useVideoUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_UPLOAD_STATE);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const resumeRef = useRef<Resume>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    resumeRef.current = null;
    setState(INITIAL_UPLOAD_STATE);
  }, []);

  // Resolves with the analysisId on success, or null on failure (state.error is set).
  const start = useCallback(async (file: File): Promise<string | null> => {
    if (busyRef.current) return null; // prevent duplicate submissions
    const validation = validateVideoFile(file);
    if (!validation.ok) {
      setState({ ...INITIAL_UPLOAD_STATE, phase: "error", error: validation.message });
      return null;
    }

    busyRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    try {
      // If a previous attempt already uploaded this same file, resume instead of re-uploading.
      let resume = resumeRef.current?.file === file ? resumeRef.current : null;
      let videoId = resume?.videoId ?? "";

      if (!resume) {
        setState({ ...INITIAL_UPLOAD_STATE, phase: "requesting", total: file.size });
        const target = await requestVideoUpload(
          { filename: file.name.slice(0, 255), contentType: validation.contentType, size: file.size },
          signal,
        );
        videoId = target.videoId;

        setState((s) => ({ ...s, phase: "uploading" }));
        await uploadVideoToStorage(
          target.uploadUrl,
          file,
          validation.contentType,
          (loaded, total) =>
            setState((s) => ({
              ...s,
              phase: "uploading",
              loaded,
              total,
              progress: total > 0 ? (loaded / total) * 100 : 0,
            })),
          signal,
        );
        resume = resumeRef.current = { file, videoId, step: "uploaded" };
      }

      if (resume.step === "uploaded") {
        setState((s) => ({ ...s, phase: "confirming", progress: 100 }));
        await confirmVideoUpload(videoId, signal);
        resume = resumeRef.current = { file, videoId, step: "confirmed" };
      }

      setState((s) => ({ ...s, phase: "starting", progress: 100 }));
      const analysis = await startVideoAnalysis(videoId, signal);
      resumeRef.current = null;
      setState((s) => ({ ...s, phase: "done", analysisId: analysis.analysisId, error: "" }));
      return analysis.analysisId;
    } catch (error) {
      if (error instanceof ApiError && error.code === "ABORTED") return null;
      // An expired/rejected upload cannot be resumed — force a fresh upload next time.
      if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
        resumeRef.current = null;
      }
      setState((s) => ({ ...s, phase: "error", error: getErrorMessage(error) }));
      return null;
    } finally {
      busyRef.current = false;
    }
  }, []);

  const busy = ["requesting", "uploading", "confirming", "starting"].includes(state.phase);
  return { state, busy, start, reset };
}

// ---------- Poll analysis status ----------

export interface PollState {
  data: AnalysisStatusResponse | null;
  error: string;
  timedOut: boolean;
}

const TERMINAL = new Set(["COMPLETED", "FAILED"]);

export function useAnalysisPolling(analysisId: string | null): PollState {
  const [state, setState] = useState<PollState & { forId: string | null }>({
    data: null,
    error: "",
    timedOut: false,
    forId: null,
  });

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const startedAt = Date.now();
    let failures = 0;

    const tick = async () => {
      try {
        const data = await getAnalysisStatus(analysisId, controller.signal);
        if (cancelled) return;
        failures = 0;
        setState({ data, error: "", timedOut: false, forId: analysisId });
        if (TERMINAL.has(data.status)) return; // stop polling
      } catch (error) {
        if (cancelled) return;
        failures += 1;
        const permanent = error instanceof ApiError && error.status >= 400 && error.status < 500;
        if (permanent || failures >= POLL_MAX_CONSECUTIVE_FAILURES) {
          setState((s) => ({ ...s, error: getErrorMessage(error), forId: analysisId }));
          return; // stop polling
        }
      }
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setState((s) => ({ ...s, timedOut: true, forId: analysisId }));
        return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    void tick();
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [analysisId]);

  if (!analysisId || state.forId !== analysisId) {
    return { data: null, error: "", timedOut: false };
  }
  return { data: state.data, error: state.error, timedOut: state.timedOut };
}
