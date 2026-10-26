const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

// Accepts either "https://host" or "https://host/api/v1" and always yields ".../api/v1"
// (no duplicated prefix, no trailing slash). Falls back to same-origin "/api/v1".
function buildBaseUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").replace(/\/+$/, "");
  if (!trimmed) return "/api/v1";
  return /\/api\/v1$/.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

export const API_BASE_URL = buildBaseUrl(RAW_BASE_URL);

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const CODE_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.",
  ABORTED: "تم إلغاء العملية.",
  VALIDATION_ERROR: "بيانات الملف غير صالحة. تحقق من الصيغة والحجم.",
  INVALID_VIDEO_ID: "معرّف الفيديو غير صالح.",
  INVALID_ANALYSIS_ID: "معرّف التحليل غير صالح.",
  VIDEO_NOT_FOUND: "لم يتم العثور على الفيديو. أعد رفع الملف.",
  ANALYSIS_NOT_FOUND: "لم يتم العثور على التحليل المطلوب.",
  INVALID_VIDEO: "الفيديو لم يكتمل رفعه أو غير صالح. أعد المحاولة.",
  INVALID_RESPONSE: "استجابة غير متوقعة من الخادم.",
  UPLOAD_FAILED: "فشل رفع الفيديو إلى التخزين. حاول مرة أخرى.",
  INTERNAL_SERVER_ERROR: "حدث خطأ في الخادم. حاول لاحقًا.",
};

function statusFallbackMessage(status: number): string {
  if (status >= 500) return CODE_MESSAGES.INTERNAL_SERVER_ERROR;
  if (status === 404) return "العنصر المطلوب غير موجود.";
  if (status >= 400) return "تعذر تنفيذ الطلب. تحقق من البيانات وحاول مرة أخرى.";
  return "حدث خطأ غير متوقع.";
}

export function makeApiError(status: number, code?: string): ApiError {
  const resolved = code && CODE_MESSAGES[code] ? code : status >= 500 ? "INTERNAL_SERVER_ERROR" : "HTTP_ERROR";
  return new ApiError(status, resolved, CODE_MESSAGES[resolved] ?? statusFallbackMessage(status));
}

// Safe, user-facing Arabic message for any thrown value (never leaks backend details).
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw makeApiError(0, "ABORTED");
    }
    throw makeApiError(0, "NETWORK_ERROR");
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const code =
      body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : undefined;
    throw makeApiError(response.status, code);
  }

  if (response.status === 204) return undefined as T;
  if (body === null || typeof body !== "object") {
    throw makeApiError(response.status, "INVALID_RESPONSE");
  }
  return body as T;
}
