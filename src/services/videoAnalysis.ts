import { apiRequest, makeApiError } from './api'
import type { AllowedContentType, AnalysisStatus as AnalysisStatusType } from '../types/analysis'

export interface VideoUploadRequest {
  filename: string
  contentType: AllowedContentType
  size: number
}

export interface VideoUploadResponse {
  videoId: string
  uploadUrl: string
  storageKey: string
  expiresIn: number
}

export interface VideoConfirmResponse {
  videoId: string
  storageKey: string
  size: number
  contentType: AllowedContentType
  status: 'UPLOADED'
}

export interface AnalysisRequest {
  videoId: string
}

export interface AnalysisResponse {
  analysisId: string
  status: 'PENDING'
}

export interface AnalysisStatusResponse {
  analysisId: string
  videoId: string
  storageKey: string
  status: AnalysisStatusType
  result: unknown | null
  error: string | null
  createdAt: string
  updatedAt: string
}

const VALID_STATUSES: readonly string[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

export async function requestVideoUpload(data: VideoUploadRequest, signal?: AbortSignal) {
  const response = await apiRequest<VideoUploadResponse>('/videos/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal,
  })
  if (!isNonEmptyString(response.videoId) || !isNonEmptyString(response.uploadUrl)) {
    throw makeApiError(200, 'INVALID_RESPONSE')
  }
  return response
}

// The Content-Type must match the value used to create the presigned URL.
export function uploadVideoToStorage(
  uploadUrl: string,
  file: File,
  contentType: AllowedContentType,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(file.size, file.size)
        resolve()
      } else {
        reject(makeApiError(xhr.status, 'UPLOAD_FAILED'))
      }
    }
    xhr.onerror = () => reject(makeApiError(0, 'NETWORK_ERROR'))
    xhr.ontimeout = () => reject(makeApiError(0, 'NETWORK_ERROR'))
    xhr.onabort = () => reject(makeApiError(0, 'ABORTED'))

    if (signal) {
      if (signal.aborted) {
        reject(makeApiError(0, 'ABORTED'))
        return
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }
    xhr.send(file)
  })
}

export function confirmVideoUpload(videoId: string, signal?: AbortSignal) {
  return apiRequest<VideoConfirmResponse>(
    `/videos/${encodeURIComponent(videoId)}/confirm`,
    { method: 'POST', signal },
  )
}

export async function startVideoAnalysis(videoId: string, signal?: AbortSignal) {
  const response = await apiRequest<AnalysisResponse>('/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId }),
    signal,
  })
  if (!isNonEmptyString(response.analysisId)) {
    throw makeApiError(200, 'INVALID_RESPONSE')
  }
  return response
}

export async function getAnalysisStatus(analysisId: string, signal?: AbortSignal) {
  const response = await apiRequest<AnalysisStatusResponse>(
    `/analyses/${encodeURIComponent(analysisId)}`,
    { signal },
  )
  if (!VALID_STATUSES.includes(response.status)) {
    throw makeApiError(200, 'INVALID_RESPONSE')
  }
  return response
}

// Compatibility with the upload screen's current service calls.
export type AnalysisStatus = Pick<AnalysisStatusResponse, 'analysisId' | 'status'> & {
  result?: unknown | null
  error?: string | null
}

export const requestUploadUrl = (file: File) => requestVideoUpload({
  filename: file.name,
  contentType: file.type as AllowedContentType,
  size: file.size,
})

export function uploadToSignedUrl(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  return uploadVideoToStorage(url, file, file.type as AllowedContentType, (loaded, total) => {
    onProgress(total > 0 ? Math.round((loaded / total) * 100) : 0)
  })
}

export const confirmUpload = confirmVideoUpload
export const createAnalysis = startVideoAnalysis
export const getAnalysis = getAnalysisStatus

export const analyzePlayer = (analysisId: string, playerId: string) => apiRequest(
  `/analyses/${encodeURIComponent(analysisId)}/player`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  },
)
