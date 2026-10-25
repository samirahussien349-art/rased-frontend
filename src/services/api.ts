const configuredBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const API_BASE_URL = configuredBase.endsWith('/api/v1')
  ? configuredBase
  : `${configuredBase}/api/v1`

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...init.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null
    throw new Error(body?.message ?? body?.error ?? `فشل الطلب (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
