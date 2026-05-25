import { toast } from 'sonner'
import { apiConfig } from '../config/api.config'
import { useAuthStore } from '../modules/auth/auth.store'
import type { RequestMeta } from './request-log'

const base = apiConfig.baseUrl

export type ApiFetchExtra = {
  /**
   * Optional callback fired after the HTTP transaction settles with the full
   * request/response metadata. Used by debug viewers — has zero impact on
   * callers that omit it.
   */
  onMeta?: (meta: RequestMeta) => void
}

function readHeaders(h: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  h.forEach((value, key) => {
    out[key] = value
  })
  return out
}

function bodyToString(body: BodyInit | null | undefined): string | null {
  if (body == null) return null
  if (typeof body === 'string') return body
  return '[non-string body]'
}

let refreshPromise: Promise<string | null> | null = null

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${base}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return null
      const { accessToken } = (await res.json()) as { accessToken: string }
      useAuthStore.getState().setAccessToken(accessToken)
      return accessToken
    } catch {
      return null
    }
  })()
  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function doLogout() {
  useAuthStore.getState().logout()
  toast.error('Sesión expirada. Por favor inicia sesión de nuevo.')
  window.location.href = '/login'
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  extra: ApiFetchExtra = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const url = `${base}${path}`
  const method = (options.method ?? 'GET').toUpperCase()
  const startedAt = Date.now()
  const t0 = performance.now()

  const emitMeta = (status: number, statusText: string, responseHeaders: Record<string, string>, responseBody: unknown) => {
    if (!extra.onMeta) return
    extra.onMeta({
      url,
      method,
      requestHeaders: headers,
      requestBody: bodyToString(options.body as BodyInit | null | undefined),
      status,
      statusText,
      responseHeaders,
      responseBody,
      durationMs: Math.round(performance.now() - t0),
      startedAt,
    })
  }

  const res = await fetch(url, { ...options, headers, credentials: 'include' })

  if (res.status === 401) {
    const newToken = await attemptRefresh()
    if (!newToken) {
      doLogout()
      throw new Error('Session expired')
    }

    const retryHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newToken}`,
      ...(options.headers as Record<string, string> | undefined),
    }
    const retryRes = await fetch(`${base}${path}`, { ...options, headers: retryHeaders, credentials: 'include' })

    if (retryRes.status === 401) {
      doLogout()
      throw new Error('Session expired')
    }

    if (retryRes.status === 403) {
      const body = await retryRes.json().catch(() => ({ message: retryRes.statusText })) as Record<string, unknown>
      if (body?.code === 'MUST_CHANGE_PASSWORD') {
        window.location.href = '/auth/change-password'
        throw new Error('MUST_CHANGE_PASSWORD')
      }
      throw body
    }

    if (!retryRes.ok) {
      throw await retryRes.json().catch(() => ({ message: retryRes.statusText }))
    }

    const retryLength = retryRes.headers.get('content-length')
    if (retryRes.status === 204 || retryLength === '0') {
      emitMeta(retryRes.status, retryRes.statusText, readHeaders(retryRes.headers), null)
      return undefined as T
    }
    const retryBody = (await retryRes.json()) as unknown
    emitMeta(retryRes.status, retryRes.statusText, readHeaders(retryRes.headers), retryBody)
    return retryBody as T
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => ({ message: res.statusText })) as Record<string, unknown>
    emitMeta(res.status, res.statusText, readHeaders(res.headers), body)
    if (body?.code === 'MUST_CHANGE_PASSWORD') {
      window.location.href = '/auth/change-password'
      throw new Error('MUST_CHANGE_PASSWORD')
    }
    throw body
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: res.statusText }))
    emitMeta(res.status, res.statusText, readHeaders(res.headers), errBody)
    throw errBody
  }

  const contentLength = res.headers.get('content-length')
  if (res.status === 204 || contentLength === '0') {
    emitMeta(res.status, res.statusText, readHeaders(res.headers), null)
    return undefined as T
  }

  const body = (await res.json()) as unknown
  emitMeta(res.status, res.statusText, readHeaders(res.headers), body)
  return body as T
}
