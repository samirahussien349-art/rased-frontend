import { apiRequest } from './api'

export interface UploadUrlResponse { videoId: string; uploadUrl: string; storageKey?: string; expiresIn?: number }
export interface AnalysisResponse { analysisId: string; status: string }
export interface AnalysisStatus { analysisId: string; status: string; result?: unknown; error?: string | null; [key: string]: unknown }

export const requestUploadUrl = (file: File) => apiRequest<UploadUrlResponse>('/videos/upload-url', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
})

export async function uploadToSignedUrl(url: string, file: File, onProgress: (progress: number) => void) {
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', url)
    request.setRequestHeader('Content-Type', file.type)
    request.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)) }
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`فشل رفع الملف إلى التخزين (${request.status})`))
    request.onerror = () => reject(new Error('تعذر الاتصال بمخزن الفيديو.'))
    request.onabort = () => reject(new Error('تم إيقاف رفع الملف.'))
    request.send(file)
  })
}

export const confirmUpload = (videoId: string) => apiRequest(`/videos/${encodeURIComponent(videoId)}/confirm`, { method: 'POST' })
export const createAnalysis = (videoId: string) => apiRequest<AnalysisResponse>('/analyses', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId }),
})
export const getAnalysis = (analysisId: string) => apiRequest<AnalysisStatus>(`/analyses/${encodeURIComponent(analysisId)}`)
export const analyzePlayer = (analysisId: string, playerId: string) => apiRequest(
  `/analyses/${encodeURIComponent(analysisId)}/player`,
  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) },
)
